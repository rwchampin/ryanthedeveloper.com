"use client";
import { useContext } from "react";
import { SidebarContext } from "contexts/SidebarContext";
import { ConfiguratorContext } from "contexts/ConfiguratorContext";

const configuratorStore = useContext(ConfiguratorContext);

const sidebarStore = useContext(SidebarContext);

export { configuratorStore, sidebarStore };