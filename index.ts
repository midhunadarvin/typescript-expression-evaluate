// Import stylesheets
import './style.css';
import { tokenizer } from './ast/tokenizer';
import { parser } from './ast/parser';
import { evaluate } from './evaluation/evaluate';
// Write TypeScript code!
const appDiv: HTMLElement = document.getElementById('app');
appDiv.innerHTML = `<h1>TypeScript Starter</h1>`;

const tests = [
  'add(2, 3)',
  ' subtract ( 5, 4 )',
  'if (is_num(5)) { add(2, 3) } else { subtract(2, 3) }'
];

const COLUMNS = ['sepallength', 'sepalwidth'];

/* Run the tests */
tests.forEach(test => {
  // Tokenize the input
  const tokens = tokenizer(test);

  // Parse the tokens and create the abstract syntax tree.
  const ast = parser(tokens, COLUMNS);

  // Evaluate the abstract syntax tree.
  const result = evaluate(ast);

  console.log(result);
});
