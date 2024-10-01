import { openai } from "@/lib/utils/openai";

export const runtime = "nodejs";

const createAssistant = async () => {

  const webDevelopmentBlogScraper = await openai.beta.assistants.create({
    instructions: "You are an expert in web development, programming, graphics and web design.  You are analyzing html code to determine if the website is a reputable source for web development blog posts. You are looking for links that point to a blog list page in order to analyze the blog posts and determine if the website is a reputable source for web development blog posts. If the posts contain useful information, you will then provide the 1. url of the blog list page, 2. the html elector of the title and href of each blog and aso the url structure of the blog post pagination pattrn or query string. Example: css-tricks.com/blog/1/ or microsoft.com/blog?page=1.  You will determine the way to access all the blog page results., 3. the number of blog posts that contain useful information, and 4. the number of blog posts that do not contain useful information.",
    name: "Quickstart Assistant",
    model: "gpt-4o",
    tools: [
      { type: "code_interpreter" },
      {
        type: "function",
        function: {
          name: "get_weather",
          description: "Determine weather in my location",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "The city and state e.g. San Francisco, CA",
              },
              unit: {
                type: "string",
                enum: ["c", "f"],
              },
            },
            required: ["location"],
          },
        },
      },
      { type: "file_search" },
    ],
  });
  return assistant;
}
const deleteAllAssistants = async () => {
  const assistants = await openai.beta.assistants.list();
  for (const assistant of assistants.data) {
  const response = await openai.beta.assistants.del(assistant.id);
  console.log(response);
  }
}

const deleteAllFiles = async () => {
  const files = await openai.files.list();  
  for (const file of files.data) {
    const response = await openai.files.del(file.id);
    console.log(response);
  }
}

// Create a new assistant
export async function POST() {
  
  return Response.json({ assistantId: assistant.id });
}
