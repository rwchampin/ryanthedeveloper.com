"use client";
import React from "react";
import styles from "./shared.module.css";

import Chat from "./chat";
import FileViewer from "./file-viewer";
import {AssistantSelector} from "@/components/AssistantSelector";

const CreateProductPage = () => {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.column}>
          <AssistantSelector />
          <FileViewer />
        </div>
        <div className={styles.chatContainer}>
          <div className={styles.chat}>
            <Chat />/
          </div>
        </div>
      </div>
    </main>
  );
};

export default CreateProductPage;
