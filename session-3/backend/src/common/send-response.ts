export const sendResponse = (statusCode: number, body: object) => {
  const response = {
    statusCode: statusCode,
    body: JSON.stringify(body),
    headers: {
      "Access-Control-Allow-Headers":
        "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      "Access-Control-Allow-Credentials": true,
      "Content-Type": "application/json",
    },
  };
  return response;
};
