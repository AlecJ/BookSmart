import OpenAI from "openai";
import { config } from "../config.js";
import type { Queryable } from "../db.js";
import { HttpError } from "../errors.js";
import type { BookRow, ChapterRow, QuestionRow } from "../types.js";

let openAiClient: OpenAI | undefined;

function client(): OpenAI {
	if (!config.openAiApiKey) {
		throw new HttpError(500, "OpenAI API is not configured.");
	}
	openAiClient ??= new OpenAI({ apiKey: config.openAiApiKey });
	return openAiClient;
}

async function promptTemplate(database: Queryable, key: string): Promise<string> {
	const result = await database.query<{ value: string }>(
		"SELECT value FROM settings WHERE key = $1",
		[key],
	);
	const template = result.rows[0]?.value;
	if (!template) throw new HttpError(500, `OpenAI prompt template "${key}" is missing.`);
	return template;
}

async function generate(input: string): Promise<string> {
	const response = await client().responses.create({
		model: config.openAiModel,
		input,
	});
	return response.output_text;
}

const MAX_GENERATED_CHAPTERS = 200;

/**
 * Last resort for books with no audiobook or Open Library contents: asks the
 * model for the published chapter list twice, in parallel, and returns []
 * unless both answers are high-confidence and agree on the chapter count.
 * In testing, single answers occasionally miscounted (24 or 18 chapters for
 * the 26 of The Catcher in the Rye) while still claiming high confidence.
 */
export async function generateChapterTitles(
	title: string,
	author: string,
): Promise<string[]> {
	const [first, second] = await Promise.all([
		askForChapterTitles(title, author),
		askForChapterTitles(title, author),
	]);
	if (!first.length || first.length !== second.length) {
		if (first.length !== second.length) {
			console.warn(
				`OpenAI chapter lists disagreed for "${title}" (${first.length} vs ${second.length}); not using either.`,
			);
		}
		return [];
	}
	return first;
}

/** One model answer: the chapter titles, or [] unless confidence is "high". */
async function askForChapterTitles(title: string, author: string): Promise<string[]> {
	const response = await client().responses.create({
		model: config.openAiChapterModel,
		// The default effort miscounted chapters noticeably more often.
		reasoning: { effort: "medium" },
		input:
			"You provide the table of contents of published books.\n" +
			`Book: "${title}" by ${author || "an unknown author"}.\n\n` +
			"List the book's chapters in order. Use the published chapter titles; if the book's " +
			'chapters are only numbered (as in many novels), return "Chapter 1", "Chapter 2", and ' +
			"so on up to the real number of chapters. Leave out front and back matter such as " +
			"introductions, acknowledgments and notes.\n\n" +
			"Rate your confidence that this matches the published book:\n" +
			'- "high": you know this specific book and its chapter structure.\n' +
			'- "medium": you know the book but are unsure of the exact chapters.\n' +
			'- "low": you do not recognize the book. Return an empty list.\n' +
			"Do not invent chapter titles for a book you do not know.",
		text: {
			format: {
				type: "json_schema",
				name: "chapter_list",
				strict: true,
				schema: {
					type: "object",
					additionalProperties: false,
					properties: {
						confidence: { type: "string", enum: ["high", "medium", "low"] },
						chapters: { type: "array", items: { type: "string" } },
					},
					required: ["confidence", "chapters"],
				},
			},
		},
	});
	let result: { confidence?: string; chapters?: unknown };
	try {
		result = JSON.parse(response.output_text);
	} catch {
		throw new HttpError(502, "OpenAI returned an invalid chapter list.");
	}
	if (result.confidence !== "high" || !Array.isArray(result.chapters)) return [];
	const chapters = result.chapters
		.filter((chapter): chapter is string => typeof chapter === "string")
		.map((chapter) => chapter.trim())
		.filter(Boolean);
	return chapters.length >= 2 && chapters.length <= MAX_GENERATED_CHAPTERS ? chapters : [];
}

export async function generateChapterQuestions(
	database: Queryable,
	_chapterId: string,
	book: BookRow,
	chapter: ChapterRow,
): Promise<string> {
	const template = await promptTemplate(database, "openai_question_template");
	const bookDetails = `\nBook Title: ${book.title}\nAuthor: ${book.author}\nChapter: ${chapter.title}\n`;
	return generate(template + bookDetails);
}

export async function evaluateAnswer(
	database: Queryable,
	book: BookRow,
	chapter: ChapterRow,
	question: QuestionRow,
	response: string,
): Promise<{ feedback_text: string; feedback_grade: number }> {
	const template = await promptTemplate(database, "openai_feedback_template");
	const input =
		`PROMPT_INSTRUCTIONS: ${template}\n\n` +
		`Book Title: ${book.title}\nAuthor: ${book.author}\nChapter: ${chapter.title}\n` +
		`QUESTION: ${question.question_text}\nSTUDENT RESPONSE: ${response}\n`;
	const generated = await generate(input);
	// The prompt's format ends with "Grade: <0, 1, or 2>." so tolerate trailing
	// punctuation and use the last grade in case the feedback mentions one.
	const match = [...generated.matchAll(/Grade:\s*([0-2])\b/g)].at(-1);
	if (!match) throw new HttpError(502, "OpenAI returned invalid feedback.");
	return {
		feedback_text: generated.slice(0, match.index).replace(/^Feedback:\s*/, "").trim(),
		feedback_grade: Number(match[1]),
	};
}
