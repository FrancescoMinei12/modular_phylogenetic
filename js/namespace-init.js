/**
 * @file module-imports.js
 * @brief Main module imports and initialization file
 * @description This file serves as the central import point for all phylogenetic application modules.
 *              It initializes the namespace structure by importing all core and UI components.
 */

/**
 * @mainpage Phylogenetic Application
 * @brief Main documentation page for the phylogenetic application
 * @section intro_sec Introduction
 * This application provides tools for phylogenetic tree visualization and analysis.
 * The system is organized into core functionality and user interface components.
 */

import { PhylogeneticTree } from "./namespace.js";

import "./core/io/file-io.js";
import "./core/parser/newickParser.js";
import "./core/taxonomy/taxon-extractor.js";
import "./core/taxonomy/custom-name-manager.js";

import "./core/utilities/calculate-diffusivity.js";
import "./core/utilities/pagination.js";

import "./ui/components/taxa-table.js";
import "./ui/components/gene-family-table.js";
import "./ui/components/product-table.js";
import "./ui/components/tabs.js";
import "./ui/components/layout-switch.js";
import "./ui/components/controllers-bar.js";

import "./ui/config/tree-config.js";

import "./ui/interactions/highlightning.js";
import "./ui/interactions/hover-functions.js";

import "./ui/visualization/tree-renderer.js";
import "./ui/visualization/color-manager.js";
import "./ui/visualization/search-bar.js";
import "./ui/visualization/tree-renderer-horizontal.js";
import "./ui/visualization/genes-renderer.js";

export { PhylogeneticTree };