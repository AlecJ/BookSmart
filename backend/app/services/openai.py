from openai import OpenAI


client = OpenAI()
model = "gpt-5-nano"


async def generate_response(self, input_text: str) -> str:

    response = client.responses.create(
        model=model,
        input=input_text
    )
    return response.output_text
