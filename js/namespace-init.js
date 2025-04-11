import { PhylogeneticTree } from "./namespace.js";

import "./core/io/file-io.js";
import "./core/parser/newickParser.js";
import "./core/taxonomy/taxon-extractor.js";
import "./core/taxonomy/custom-name-manager.js";

import "./ui/visualization/tree-renderer.js";
import "./ui/visualization/product-genes-renderer.js";
import "./ui/visualization/color-manager.js";
import "./ui/visualization/search-bar.js";

import "./ui/interactions/highlightning.js";
import "./ui/interactions/hover-functions.js";

import "./ui/components/taxa-table.js";
import "./ui/components/gene-family-table.js";
import "./ui/components/product-table.js";
import "./ui/components/tabs.js";

export { PhylogeneticTree };