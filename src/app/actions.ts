"use server";


import { openai } from "@/lib/utils/openai";
import { createClient } from "@/lib/utils/supabase/server";
import { headers } from "next/headers";
import { 
  revalidatePath,
 } from "next/cache";
import { redirect } from "next/navigation";
/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string,
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = createClient();
  const origin = headers().get("origin");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/protected");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = createClient();
  const origin = headers().get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

const getAssistantId = async () => {
    const {data} = await openai.beta.assistants.list();

    if (data.length === 0) {
        return null;
    }

    return data[0].id;
}

const getOrCreateVectorStore = async () => {
    const assistantId = await getAssistantId();
    const assistant = await openai.beta.assistants.retrieve(assistantId);

    if (assistant.tool_resources?.file_search?.vector_store_ids?.length > 0) {
        return assistant.tool_resources.file_search.vector_store_ids[0];
    }

    const vectorStore = await openai.beta.vectorStores.create({
        name: "File Search",
    });

    await openai.beta.assistants.update(assistantId, {
        tool_resources: {
            file_search: {
                vector_store_ids: [vectorStore.id],
            },
        },
    });

    return vectorStore.id;
}


 export const uploadFileAction = async (formData: FormData) => {
  const file = formData.get("file") as File;
  const vectorStoreId = await getOrCreateVectorStore();

  const openaiFile = await openai.files.create({
    file: file,
    purpose: "assistants",
  });

  await openai.beta.vectorStores.files.create(vectorStoreId, {
    file_id: openaiFile.id,
  });

 }


export const fetchFilesAction = async () => {
    const vectorStoreId = await getOrCreateVectorStore();
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

    return filesArray;
}

export const getAssistants = async () => {
    const assistants = await openai.beta.assistants.list();
    return assistants.data;
}

 
export const deleteAssistant = async (id: string) => {
    // get assistabts
    const assistants = await openai.beta.assistants.list();
    // get length of assistants
    const length = assistants.data.length;

    // if length is 0 return 
    if (length === 0) return Error("No assistants to delete");

    // if length is 1 return
    if (length === 1) {
        return Error("Cannot delete the last assistant");
    }

    await openai.beta.assistants.del(id);


    return {
        deletedId: id,
        currentAssistants: getAssistants(),
    }
}
 

export const googleLoginAction = async () => {

  const supabase = createClient();
  const origin = headers().get('origin')

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/v1/callback`,
    },
  });

  if (error) {
    console.log(error)
    redirect('/error')
  }
  revalidatePath('/admin')
  redirect('/admin')
};