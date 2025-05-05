//evals.ts

import { EvalConfig } from 'mcp-evals';
import { openai } from "@ai-sdk/openai";
import { grade, EvalFunction } from "mcp-evals";

const run_codeEval: EvalFunction = {
  name: "run_code Tool Evaluation",
  description: "Evaluates the functionality of the run_code tool",
  run: async () => {
    const result = await grade(openai("gpt-4"), "Please write a Python script that uses the requests library to fetch the latest exchange rates from a public API that is not integrated with existing tools. Parse the JSON response and print out the currency symbol and the exchange rate for USD, EUR, and GBP. Then run the code in your secure environment and provide the output.");
    return JSON.parse(result);
  }
};

const set_env_varEval: EvalFunction = {
  name: "set_env_var Tool Evaluation",
  description: "Evaluates if an environment variable was correctly set",
  run: async () => {
    const result = await grade(openai("gpt-4"), "Please set the environment variable 'MY_TEST_VAR' to the value 'test123'. Confirm that it has been successfully set.");
    return JSON.parse(result);
  }
};

const remove_env_varEval: EvalFunction = {
  name: "remove_env_var Tool Evaluation",
  description: "Evaluates removing a YepCode environment variable",
  run: async () => {
    const result = await grade(openai("gpt-4"), "Please remove the environment variable named 'MY_SECRET_KEY' from my YepCode environment.");
    return JSON.parse(result);
  }
};

const get_executionEval: EvalFunction = {
    name: 'get_execution Tool Evaluation',
    description: 'Evaluates the accuracy and completeness of get_execution tool usage',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Could you retrieve the logs and status from a YepCode job with the ID 12345?");
        return JSON.parse(result);
    }
};

const run_ycp_processEval: EvalFunction = {
  name: 'run_ycp_processEval',
  description: 'Evaluates the correctness of the run_ycp_process tool functionality',
  run: async () => {
    const result = await grade(openai("gpt-4"), "Please run the process named 'testProcess' with parameters {\"param1\":\"value1\",\"param2\":42} and return the outcome.");
    return JSON.parse(result);
  }
};

const config: EvalConfig = {
    model: openai("gpt-4"),
    evals: [run_codeEval, set_env_varEval, remove_env_varEval, get_executionEval, run_ycp_processEval]
};
  
export default config;
  
export const evals = [run_codeEval, set_env_varEval, remove_env_varEval, get_executionEval, run_ycp_processEval];