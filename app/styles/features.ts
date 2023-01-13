import tw from "tailwind.config.js";

export const todoStyle = {
  type: "circle",
  paint: {
    "circle-radius": 8,
    "circle-color": tw.theme.extend.colors.todo,
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 0.5,
  },
};

export const mandatoryStyle = {
  type: "circle",
  paint: {
    "circle-radius": 8,
    "circle-color": tw.theme.extend.colors.mandatory,
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 0.5,
  },
};

export const optionalStyle = {
  type: "circle",
  paint: {
    "circle-radius": 8,
    "circle-color": tw.theme.extend.colors.optional,
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 0.5,
  },
};

export const doneStyle = {
  type: "circle",
  paint: {
    "circle-radius": 8,
    "circle-color": tw.theme.extend.colors.done,
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 0.5,
  },
};

export const highlightedStyle = {
  type: "circle",
  paint: {
    "circle-radius": 10,
    "circle-color": tw.theme.extend.colors.highlighted,
  },
};

export const mandatoryStyle_mobile = {
  type: "circle",
  paint: {
    "circle-radius": 12,
    "circle-color": tw.theme.extend.colors["mandatory-mobile"],
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 0.5,
  },
};

export const optionalStyle_mobile = {
  type: "circle",
  paint: {
    "circle-radius": 12,
    "circle-color": tw.theme.extend.colors["optional-mobile"],
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 0.5,
  },
};

export const doneStyle_mobile = {
  type: "circle",
  paint: {
    "circle-radius": 12,
    "circle-color": tw.theme.extend.colors["done-mobile"],
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 0.5,
  },
};
