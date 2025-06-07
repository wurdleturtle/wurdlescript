const fs = require("fs");
const path = require("path");

function tokenize(code) {
  const tokens = [];
  let i = 0;

  while (i < code.length) {
    const char = code[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    if (char === "'") {
      let str = "'";
      i++;
      while (i < code.length && code[i] !== "'") {
        str += code[i];
        i++;
      }
      str += "'";
      tokens.push({ type: "STRING", value: str });
      i++;
      continue;
    }

    switch (char) {
      case ":":
        tokens.push({ type: "COLON" });
        i++;
        break;
      case "{":
        tokens.push({ type: "LBRACE" });
        i++;
        break;
      case "}":
        tokens.push({ type: "RBRACE" });
        i++;
        break;
      case "(":
        tokens.push({ type: "LPAREN" });
        i++;
        break;
      case ")":
        tokens.push({ type: "RPAREN" });
        i++;
        break;
      case ";":
        tokens.push({ type: "SEMICOLON" });
        i++;
        break;
      default:
        if (/[a-zA-Z_]/.test(char)) {
          let word = "";
          while (i < code.length && /[a-zA-Z_]/.test(code[i])) {
            word += code[i];
            i++;
          }

          switch (word) {
            case "func":
              tokens.push({ type: "FUNCTION", value: "func" });
              break;
            case "Void":
              tokens.push({ type: "TYPE", value: "Void" });
              break;
            default:
              tokens.push({ type: "IDENTIFIER", value: word });
              break;
          }
        } else {
          i++;
        }
        break;
    }
  }

  return tokens;
}

let parserState = null;

function parseTokens(tokenType, tokenValue) {
  switch (tokenType) {
    case "FUNCTION":
      parserState = "function";
      return `function `;
    case "IDENTIFIER":
      if (parserState === "function") {
        parserState = null;
        return `${tokenValue}() `;
      }
      if (tokenValue === "log") {
        parserState = null;
        return "console.log";
      }
      return `${tokenValue}()`;
    case "TYPE":
      return " ";
    case "COLON":
      return " ";
    case "LPAREN":
      return "(";
    case "RPAREN":
      return ")";
    case "SEMICOLON":
      return ";";
    case "LBRACE":
      return "{";
    case "RBRACE":
      return "}";
    case "STRING":
      return tokenValue;
    default:
      return null;
  }
}

function compile(inputFile, outputFile) {
  try {
    const sourceCode = fs.readFileSync(inputFile, "utf8");
    const tokens = tokenize(sourceCode);
    let compiledCode = "";
    tokens.forEach((token) => {
      compiledCode += parseTokens(token.type, token.value);
    });
    if (outputFile === "evaluate") {
      eval(compiledCode);
      return;
    }
    fs.writeFileSync(outputFile, compiledCode);
    console.log(`Compiled ${inputFile} to ${outputFile} successfully`);
    console.log("Compiled code:");
    console.log(compiledCode);
  } catch (error) {
    console.error(`Error in compilation: ${error.message}`);
  }
}
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log("Usage: node wurdle-compiler.js <input.wurdle> [output.js]");
  console.log("Example: node wurdle-compiler.js example.wurdle");
  process.exit(1);
}
const inputFile = args[0];
const outputFile = args[1] || "evaluate";
compile(inputFile, outputFile);
