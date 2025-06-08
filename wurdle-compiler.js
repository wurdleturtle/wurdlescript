const fs = require("fs");
const path = require("path");
function tokenize(code) {
  const tokens = [];
  let i = 0;
  while (i < code.length) {
    let char = code[i];
    if (/\s/.test(char)) {
      i++;
      continue;
    }
    if (/[0-9]/.test(char)) {
      let num = "";
      while (i < code.length && /[0-9]/.test(code[i])) {
        num += code[i];
        i++;
      }
      tokens.push({ type: "NUMBER", value: num });
      continue;
    }
    if (char === "'") {
      let str = "";
      i++;
      while (i < code.length && code[i] !== "'") {
        str += code[i];
        i++;
      }
      tokens.push({ type: "STRING", value: str });
      i++;
      continue;
    }
    if (/[a-zA-Z_]/.test(char)) {
      let word = "";
      while (i < code.length && /[a-zA-Z0-9_]/.test(code[i])) {
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
        case "var":
          tokens.push({ type: "VARIABLE", value: "var" });
          break;
        case "log":
          tokens.push({ type: "LOG", value: "log" });
          break;
        default:
          tokens.push({ type: "IDENTIFIER", value: word });
          break;
      }
      continue;
    }
    const simpleTokens = {
      ":": "COLON",
      "{": "LBRACE",
      "}": "RBRACE",
      "(": "LPAREN",
      ")": "RPAREN",
      ";": "SEMICOLON",
      "=": "EQUALS",
      "+": "PLUS",
    };
    if (simpleTokens[char]) {
      tokens.push({ type: simpleTokens[char] });
      i++;
      continue;
    }
    throw new Error(`Unrecognized character: ${char}`);
  }
  return tokens;
}
function parse(tokens) {
  let output = "";
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    const nextToken = tokens[i + 1];
    const prevToken = tokens[i - 1];
    switch (token.type) {
      case "FUNCTION":
        output += "function ";
        break;
      case "IDENTIFIER":
        if (prevToken && prevToken.type === "FUNCTION") {
          output += token.value;
          if (tokens[i + 1] && tokens[i + 1].type === "COLON") {
            i += 2;
          }
          output += "()";
        } else if (nextToken && nextToken.type === "SEMICOLON") {
          output += token.value + "()";
        } else {
          output += token.value;
        }
        break;
      case "VARIABLE":
        output += "let ";
        break;
      case "NUMBER":
        output += token.value;
        break;
      case "EQUALS":
        output += " = ";
        break;
      case "STRING":
        output += `'${token.value}'`;
        break;
      case "LOG":
        output += "console.log";
        break;
      case "LPAREN":
        output += "(";
        break;
      case "RPAREN":
        output += ")";
        break;
      case "LBRACE":
        output += " {\n";
        break;
      case "RBRACE":
        output += "}\n";
        break;
      case "SEMICOLON":
        output += ";\n";
        break;
      case "COLON":
        break;
      case "PLUS":
        output += ` + `;
        break;
      case "TYPE":
        break;
      default:
        throw new Error(`Unknown token type: ${token.type}`);
    }
    i++;
  }
  return output;
}
function compile(inputFile, outputFile) {
  try {
    const sourceCode = fs.readFileSync(inputFile, "utf8");
    const tokens = tokenize(sourceCode);
    const compiledCode = parse(tokens);
    if (outputFile === "evaluate") {
      console.log("--- Compiled Code ---");
      console.log(compiledCode);
      console.log("--- Evaluation ---");
      eval(compiledCode);
      return;
    }
    fs.writeFileSync(outputFile, compiledCode);
    console.log(`Compiled ${inputFile} to ${outputFile} successfully`);
    console.log("--- Compiled Code ---");
    console.log(compiledCode);
  } catch (error) {
    console.error(`Error in compilation: ${error.message}`);
  }
}
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log("Usage: node your-compiler-name.js <input.wurdle> [output.js]");
  console.log("Example: node your-compiler-name.js example.wurdle evaluate");
  process.exit(1);
}
const inputFile = args[0];
const outputFile = args[1] || "evaluate";
compile(inputFile, outputFile);
