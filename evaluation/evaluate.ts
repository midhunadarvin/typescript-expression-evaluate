import { FUNCTIONS } from '../ast/FUNCTIONS';
import { NODE_TYPE } from '../ast/NODE_TYPE';

// The main evaluate function
export function evaluate(ast) {
  if (ast && ast.type !== 'Program') {
    return TypeError('Error in evaluation: Unknown object ' + ast);
  }
  const result = [];
  for (let child of ast.body) {
    // For each of the children in the body of the ast
    // we will call evaluateExpression to evaluate what type of
    // node it is.
    result.push(evaluateExpression(child));
  }
  return result;
}

// In this function we will evaluate what node it is and then
// pass the node to it's corresponding handler
function evaluateExpression(node) {
  switch (node.type) {
    case NODE_TYPE.NUMBER: {
      return evaluateNumberLiteral(node);
    }
    case NODE_TYPE.STRING: {
      return evaluateStringLiteral(node);
    }
    case NODE_TYPE.CALL_EXPRESSION: {
      return evaluateCallExpression(node);
    }
    case NODE_TYPE.IF_CONDITION: {
      return evaluateIfCondition(node);
    }
  }
}

// For a number literal node, we simply return it's value
function evaluateNumberLiteral(node) {
  return Number(node.value);
}

// For a string literal node, we simply return it's value
function evaluateStringLiteral(node) {
  return node.value;
}

// For a call expression node, we first check what function call
// is to be executed, and then call it's corresponding handler.
function evaluateCallExpression(node) {
  switch (node.name) {
    case FUNCTIONS.add: {
      return evaluateAddFunction(node);
    }
    case FUNCTIONS.subtract: {
      return evaluateSubtractFunction(node);
    }
    case FUNCTIONS.is_num: {
      return evaluateIsNumFunction(node);
    }
  }
}

// In add function expression : add (2, 3)
// We first evaluate the parameters, and then add those
// values together.
function evaluateAddFunction(node) {
  if (!node || !node.params || node.params.length === 0) {
    return SyntaxError('Missing Parameters for add function ' + node);
  }
  // Here we recursively call evaluateExpression to get the parameters
  // as a number
  const params = node.params.map(param => {
    return evaluateExpression(param);
  });

  return params.reduce((acc, item) => {
    return acc + Number(item);
  }, 0);
}

// In subtract function expression : add (5, 4)
// We first evaluate the parameters, and then subtract
// the values from the first parameter
function evaluateSubtractFunction(node) {
  if (!node || !node.params || node.params.length === 0) {
    return SyntaxError('Missing Parameters for subtract function ' + node);
  }
  // Here we recursively call evaluateExpression to get the parameters
  // as a number
  const params = node.params.map(param => {
    return evaluateExpression(param);
  });

  let result = params[0];
  for (let i = 1; i < params.length; i++) {
    result -= params[i];
  }

  return result;
}
// Here we evaluate whether the give
function evaluateIsNumFunction(node) {
  for (let i = 0; i < node.params.length; i++) {
    const param = evaluateExpression(node.params[i]);
    if (isNaN(Number(param))) {
      return false;
    }
  }
  return true;
}

function evaluateIfCondition(node) {
  if (!node || !node.condition || !node.trueBody || !node.falseBody) {
    return SyntaxError('Missing parameters for IF condition ' + node);
  }

  const condition = evaluateExpression(node.condition);
  if (condition) {
    return evaluateExpression(node.trueBody);
  } else {
    return evaluateExpression(node.falseBody);
  }
}
