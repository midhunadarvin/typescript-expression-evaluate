import { FUNCTIONS } from '../ast/FUNCTIONS';
import { NODE_TYPE } from '../ast/NODE_TYPE';

export function evaluate(ast) {
  if (ast && ast.type !== 'Program') {
    return TypeError('Error in evaluation: Unknown object ' + ast);
  }
  const result = [];
  for (let child of ast.body) {
    result.push(evaluateExpression(child));
  }
  return result;
}

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

function evaluateNumberLiteral(node) {
  // For a number literal node, we simply return it's value
  return Number(node.value);
}

function evaluateStringLiteral(node) {
  // For a string literal node, we simply return it's value
  return node.value;
}

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

function evaluateIsNumFunction(node) {
  return !isNaN(Number(node.value));
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
