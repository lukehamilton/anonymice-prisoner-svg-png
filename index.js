const fs = require("fs");

const sharp = require("sharp");
const { parse } = require("svg-parser");

// Helper to convert node to str with optional key transforms
const convertNodeToStr = (node, keyTransforms = {}) => {
  let str = `<${node.tagName} `;
  const props = Object.entries(node.properties);
  for (let i = 0; i < props.length; i++) {
    const [k, v] = props[i];
    const value = keyTransforms.hasOwnProperty(k) ? keyTransforms[k](v) : v;
    str += `${k}='${value}' `;
  }
  str += "/>";
  return str;
};

async function main() {
  // Read in input file and parse to svg tree
  // Note: Can also pass in a string (e.g. when requesting the svg from an API)
  const buffer = fs.readFileSync("./input.svg");
  const fileContent = buffer.toString();
  const parsedSvg = parse(fileContent);

  // Get base64 image strings for background, foreground, and mouse
  const images = parsedSvg.children[0].children;

  // Convert background and foreground images to strings
  const bgNode = images[0];
  const bgStr = convertNodeToStr(bgNode);
  const fgNode = images[2];
  const fgStr = convertNodeToStr(fgNode);

  // Get properties of mouse base64 image tag
  const mouseStrProps = images[1].properties;
  // Get offsets to position mouse head
  const { x: xOffset, y: yOffset } = mouseStrProps;

  // Parse base64 mouse image string to get svg tree
  const mouseDataBase64 = mouseStrProps["xlink:href"].split(",")[1];
  const mouseBuffer = Buffer.from(mouseDataBase64, "base64");
  const mouseStr = mouseBuffer.toString("ascii");
  const parsedMouseSvg = parse(mouseStr);

  // Convert nodes back to strings with proper offsets
  const mouseNodes = parsedMouseSvg.children[0].children;

  // Get rectangles from mouse svg to position properly and convert to strings
  const rectNodes = mouseNodes.filter(mn => mn.tagName === "rect");
  let rectStr = "";

  // Mouse px transforms
  const topLeftFn = {
    x: val => parseInt(val * 2) + xOffset,
    y: val => parseInt(val * 2) + yOffset
  };

  const topRightFn = {
    x: val => parseInt(val * 2) + xOffset + 1,
    y: val => parseInt(val * 2) + yOffset
  };

  const bottomLeftFn = {
    x: val => parseInt(val * 2) + xOffset,
    y: val => parseInt(val * 2) + yOffset + 1
  };

  const bottomRightFn = {
    x: val => parseInt(val * 2) + xOffset + 1,
    y: val => parseInt(val * 2) + yOffset + 1
  };

  // Convert mouse svg rect nodes to strings
  for (let i = 0; i < rectNodes.length; i++) {
    const node = rectNodes[i];
    const topLeft = convertNodeToStr(node, topLeftFn);
    const topRight = convertNodeToStr(node, topRightFn);
    const bottomLeft = convertNodeToStr(node, bottomLeftFn);
    const bottomRight = convertNodeToStr(node, bottomRightFn);
    rectStr += topLeft + topRight + bottomLeft + bottomRight;
  }

  // Get style node from mouse svg to convert to string
  const styleNode = mouseNodes.filter(mn => mn.tagName === "style");
  const styleStr = `<style>${styleNode[0].children[0].value}</style>`;

  // Concatenate parts to create output svg string
  const modifiedInputStr = `<svg id="prisoner" width="100%" height="100%" viewBox="0 0 88 98" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${bgStr}${rectStr}${styleStr}${fgStr}</svg>`;

  sharp(Buffer.from(modifiedInputStr))
    .png()
    .toFile("output.png")
    .then(function (info) {
      console.log(info);
    })
    .catch(function (err) {
      console.log(err);
    });
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
