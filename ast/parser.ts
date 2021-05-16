import { NODE_TYPE } from './NODE_TYPE';
import { TOKEN } from './TOKEN';
/**
 * ============================================================================
 *                                 ヽ/❀o ل͜ o\ﾉ
 *                                THE PARSER!!!
 * ============================================================================
 */

/**
 * For our parser we're going to take our array of tokens and turn it into an
 * AST.
 *
 *   [{ type: 'paren', value: '(' }, ...]   =>   { type: 'Program', body: [...] }
 */

// Okay, so we define a `parser` function that accepts our array of `tokens`.
export function parser(tokens, COLUMNS = {}) {
  // Again we keep a `current` variable that we will use as a cursor.
  let current = 0;

  // But this time we're going to use recursion instead of a `while` loop. So we
  // define a `walk` function.
  function walk() {
    // Inside the walk function we start by grabbing the `current` token.
    let token = tokens[current];

    // We're going to split each type of token off into a different code path,
    // starting off with `number` tokens.
    //
    // We test to see if we have a `number` token.
    if (token.type === TOKEN.NUMBER) {
      // If we have one, we'll increment `current`.
      current++;

      // And we'll return a new AST node called `NumberLiteral` and setting its
      // value to the value of our token.
      return {
        type: NODE_TYPE.NUMBER,
        value: token.value
      };
    }

    // If we have a string we will do the same as number and create a
    // `StringLiteral` node.
    if (token.type === TOKEN.STRING) {
      current++;

      return {
        type: NODE_TYPE.STRING,
        value: token.value
      };
    }

    // Here now we are looking for any FUNCTION token
    if (token.type === TOKEN.FUNCTION) {
      return CallExpression();
    }

    // Here now we are looking for any IF token
    if (token.type === TOKEN.IF) {
      return IfCondition();
    }

    // Here now we are looking for any name token
    if (token.type === TOKEN.NAME) {
      // Next we're going to look for any function calls. We do this by checking
      // the token value is one of our available functions.
      if (token.value in COLUMNS) {
        return ColumnName();
      } else {
        throw new TypeError('Unknown variable: ' + token.value);
      }
    }

    // Again, if we haven't recognized the token type by now we're going to
    // throw an error.
    throw new TypeError(token.type);
  }

  function IfCondition() {
    // Here we evaluate the expression inside of the if conditional.
    let token = tokens[current];

    let node = {
      type: NODE_TYPE.IF_CONDITION,
      condition: null,
      trueBody: null,
      falseBody: null
    };

    /**
     * BEGIN: GET THE CONDITION
     * */
    // We increment `current` *again* to skip the IF token.
    token = tokens[++current];

    // Next we're going to look for open parenthesis. If it is not a open parenthesis
    // there is a syntax issue in the code.
    if (token.type !== TOKEN.OPEN_PAREN) {
      throw new SyntaxError('Invalid IfCondition: ' + node);
    }

    // We increment `current` *again* to skip the open parenthesis token.
    token = tokens[++current];

    // So we create a `while` loop that will continue until it encounters a
    // token with a `type` of `'close_paren'` and a `value` of a closing
    // parenthesis.
    while (token.type !== TOKEN.CLOSE_PAREN) {
      // we'll call the `walk` function which will return a `node` and we'll
      // push it into our `node.params`.
      node.condition = walk();
      token = tokens[current];
    }

    // We increment `current` *again* to skip the close parenthesis token.
    token = tokens[++current];
    /**
     * END: GET THE CONDITION
     **/

    /**
     * BEGIN: GET THE TRUE BODY
     **/
    // Next we're going to look for open curly braces. If it is not a open curly braces,
    // then there is a syntax issue in the code.
    if (token.type !== TOKEN.OPEN_BLOCK) {
      throw new SyntaxError('Invalid IfCondition: Missing Condition' + node);
    }

    // We increment `current` *again* to skip the 'open_block' token.
    token = tokens[++current];

    // And now we want to loop through each token that will be the `condition` of
    // the IF conditional

    // So we create a `while` loop that will continue until it encounters a
    // token with a `type` of `'close_block'`
    while (token.type !== TOKEN.CLOSE_BLOCK) {
      // we'll call the `walk` function which will return a `node` and we'll
      // push it into our `node.condition`.
      node.trueBody = walk();
      token = tokens[current];
    }

    // We increment `current` *again* to skip the 'close_block' token.
    token = tokens[++current];

    if (token.type !== TOKEN.ELSE) {
      throw new SyntaxError('Invalid IfCondition: Missing else' + node);
    }

    // We increment `current` *again* to skip the 'else' token.
    token = tokens[++current];

    /**
     * END: GET THE FALSE BODY
     **/
    // Next we're going to look for open curly braces. If it is not a open curly braces,
    // then there is a syntax issue in the code.
    if (token.type !== TOKEN.OPEN_BLOCK) {
      throw new SyntaxError(
        'Invalid IfCondition: Missing else condition' + node
      );
    }

    // We increment `current` *again* to skip the 'open_block' token.
    token = tokens[++current];

    // And now we want to loop through each token that will be the `falseBody` of
    // the IF conditional

    // So we create a `while` loop that will continue until it encounters a
    // token with a `type` of `'close_block'`
    while (token.type !== TOKEN.CLOSE_BLOCK) {
      // we'll call the `walk` function which will return a `node` and we'll
      // push it into our `node.falseBody`.
      node.falseBody = walk();
      token = tokens[current];
    }

    // We increment `current` *again* to skip the 'close_block' token.
    token = tokens[++current];
    /**
     * END: GET THE FALSE BODY
     **/

    return node;
  }

  function CallExpression() {
    // Here we evaluate the expression inside of the call function.
    let token = tokens[current];

    let node = {
      type: NODE_TYPE.CALL_EXPRESSION,
      name: token.value,
      params: []
    };

    // We increment `current` *again* to skip the function name token.
    token = tokens[++current];

    // Next we're going to look for open parenthesis. If it is not a open parenthesis
    // there is a syntax issue in the code.
    if (token.type !== TOKEN.OPEN_PAREN) {
      throw new SyntaxError('Invalid CallExpression: ' + node);
    }

    // We increment `current` *again* to skip the 'open_paren' token.
    token = tokens[++current];

    // And now we want to loop through each token that will be the `params` of
    // our `CallExpression` until we encounter a closing parenthesis.
    //
    // Now this is where recursion comes in. Instead of trying to parse a
    // potentially infinitely nested set of nodes we're going to rely on
    // recursion to resolve things.
    //
    // To explain this, let's take our code. You can see that the
    // parameters of the `add` are a number and a nested `CallExpression` that
    // includes its own numbers.
    //
    //   add( 2, subtract(4 2) )
    //
    // You'll also notice that in our tokens array we have multiple closing
    // parenthesis.
    //
    //   [
    //     { type: 'name',        value: 'add'      },
    //     { type: 'open_paren',  value: '('        },
    //     { type: 'number',      value: '2'        },
    //     { type: 'open_paren',  value: '('        },
    //     { type: 'name',        value: 'subtract' },
    //     { type: 'number',      value: '4'        },
    //     { type: 'number',      value: '2'        },
    //     { type: 'close_paren', value: ')'        }, <<< Closing parenthesis
    //     { type: 'close_paren', value: ')'        }, <<< Closing parenthesis
    //   ]
    //
    // We're going to rely on the nested `walk` function to increment our
    // `current` variable past any nested `CallExpression`.

    // So we create a `while` loop that will continue until it encounters a
    // token with a `type` of `'close_paren'` and a `value` of a closing
    // parenthesis.
    while (token.type !== TOKEN.CLOSE_PAREN) {
      // we'll call the `walk` function which will return a `node` and we'll
      // push it into our `node.params`.
      node.params.push(walk());
      token = tokens[current];
    }

    // Finally we will increment `current` one last time to skip the closing
    // parenthesis.
    current++;

    // And return the node.
    return node;
  }

  function ColumnName() {
    // Here we get the column name and we return it.
    let token = tokens[current];
    return {
      type: 'ColumnName',
      name: token.value
    };
  }

  // Now, we're going to create our AST which will have a root which is a
  // `Program` node.
  let ast = {
    type: NODE_TYPE.PROGRAM,
    body: []
  };

  // And we're going to kickstart our `walk` function, pushing nodes to our
  // `ast.body` array.
  //
  // The reason we are doing this inside a loop is because our program can have
  // `CallExpression` after one another instead of being nested.
  //
  //   (add 2 2)
  //   (subtract 4 2)
  //
  while (current < tokens.length) {
    ast.body.push(walk());
  }

  // At the end of our parser we'll return the AST.
  return ast;
}
