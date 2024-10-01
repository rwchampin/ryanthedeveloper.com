import { assistantId } from "@/app/assistant-config";
import { openai } from "@/lib/utils/openai";
import { toast } from "sonner"; // Assuming you're using react-toastify for notifications

let networkRequests = 0;
const MAX_NETWORK_REQUESTS_PER_SECOND = 5;
const networkQueue: (() => Promise<void>)[] = [];
let lastRequestTime = Date.now();

const processQueue = async () => {
  if (networkQueue.length === 0) return;

  const now = Date.now();
  if (now - lastRequestTime >= 1000) {
    networkRequests = 0;
    lastRequestTime = now;
  }

  while (networkRequests < MAX_NETWORK_REQUESTS_PER_SECOND && networkQueue.length > 0) {
    const request = networkQueue.shift();
    if (request) {
      networkRequests++;
      request().finally(() => {
        networkRequests--;
        processQueue();
      });
    }
  }

  if (networkQueue.length > 0) {
    setTimeout(processQueue, 1000 - (Date.now() - lastRequestTime));
  }
};

const enqueueRequest = (request: () => Promise<void>) => {
  networkQueue.push(request);
  if (networkQueue.length > 20) {
    toast.error("Too many requests. Please try again later.");
  }
  processQueue();
};

// upload file to assistant's vector store
export async function POST(request) {
  enqueueRequest(async () => {
    const formData = await request.formData(); // process file as FormData
    const file = formData.get("file"); // retrieve the single file from FormData
    const vectorStoreId = await getOrCreateVectorStore(); // get or create vector store

    // upload using the file stream
    const openaiFile = await openai.files.create({
      file: file,
      purpose: "assistants",
    });

    // add file to vector store
    await openai.beta.vectorStores.files.create(vectorStoreId, {
      file_id: openaiFile.id,
    });
  });

  return new Response();
}

// list files in assistant's vector store
export async function GET() {
  enqueueRequest(async () => {
    const vectorStoreId = await getOrCreateVectorStore(); // get or create vector store
    const fileList = await openai.beta.vectorStores.files.list(vectorStoreId);

    const filesArray = await Promise.all(
      fileList.data.map(async (file) => {
        const fileDetails = await openai.files.retrieve(file.id);
        const vectorFileDetails = await openai.beta.vectorStores.files.retrieve(
          vectorStoreId,
          file.id
        );
        return {
          file_id: file.id,
          filename: fileDetails.filename,
          status: vectorFileDetails.status,
        };
      })
    );
    return Response.json(filesArray);
  });

  return new Response();
}

// delete file from assistant's vector store
export async function DELETE(request) {
  enqueueRequest(async () => {
    const body = await request.json();
    const fileId = body.fileId;

    const vectorStoreId = await getOrCreateVectorStore(); // get or create vector store
    await openai.beta.vectorStores.files.del(vectorStoreId, fileId); // delete file from vector store
  });

  return new Response();
}

/* Helper functions */

const getOrCreateVectorStore = async () => {
  const assistant = await openai.beta.assistants.retrieve(assistantId);

  // if the assistant already has a vector store, return it
  if (assistant.tool_resources?.file_search?.vector_store_ids?.length > 0) {
    return assistant.tool_resources.file_search.vector_store_ids[0];
  }
  // otherwise, create a new vector store and attach it to the assistant
  const vectorStore = await openai.beta.vectorStores.create({
    name: "sample-assistant-vector-store",
  });
  await openai.beta.assistants.update(assistantId, {
    tool_resources: {
      file_search: {
        vector_store_ids: [vectorStore.id],
      },
    },
  });
  return vectorStore.id;
};