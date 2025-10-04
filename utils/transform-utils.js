// utils/transform-utils.js  v4 ESM
import _ from "lodash";

const TOKEN_DICTIONARY = {
  component: "comp",
  typescale: "ts",
  inset: "is",
  inline: "il",
  stack: "st",
};

const DROP_SPACE_FOR = new Set(["stack", "inset", "inline"]);

export const nameBuilder = (token, options) => {
  const { path, attributes } = token;
  const { domain, category, component } = attributes || {};

  const tokenPrefixes = [
    options?.prefix,
    domain === "space" && DROP_SPACE_FOR.has(category) ? null : domain,
    category,
    component,
  ];

  const cleanTokenPrefix = tokenPrefixes
    .filter(Boolean)
    .map((pfx) => _.kebabCase(TOKEN_DICTIONARY[pfx] || pfx));

  cleanTokenPrefix.slice(1).forEach((pfx) => {
    if (!(path?.includes(pfx) || !path?.includes(TOKEN_DICTIONARY[pfx]))) {
      throw new Error(
        `ERROR: token path does not match attributes (${pfx} - ${path?.join("-")})`,
      );
    }
    return pfx;
  });

  const transformedTokenPath = (path || [])
    .slice(2)
    .map((part) =>
      /_/.test(part) || /\d+[a-zA-Z]/.test(part) ? part : _.kebabCase(part),
    );

  return cleanTokenPrefix.concat(transformedTokenPath).join("-");
};

export const EDS_SCSS_KEBAB_SNAKE_TRANSFORM = {
  name: "edsScssKebabSnakeTransform",
  type: "name",
  transitive: false,
  transform: (token, options) => nameBuilder(token, options),
};

export const EDS_SCSS_HEX_SIX_TO_THREE_DIGIT_TRANSFORM = {
  name: "edsScssHexSixToThreeDigitTransform",
  type: "value",
  transitive: false,
  // v4 uses filter instead of matcher
  filter: (token) => /^#((\d|[a-f]){3}|(\d|[a-f]){6})$/i.test(token.value),
  transform: (token) => {
    const HEX_MATCH = /^#((\w)\2)((\w)\4)((\w)\6)$/i;
    const m = String(token.value).match(HEX_MATCH);
    return m ? `#${m[2]}${m[4]}${m[6]}` : token.value;
  },
};

export const EDS_SCSS_ZERO_REM_TRANSFORM = {
  name: "edsScssZeroRemTransform",
  type: "value",
  transitive: false,
  filter: (token) => token.value === "0rem",
  transform: () => "0",
};
