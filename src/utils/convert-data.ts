/**
 * The function `serializeFromJsonToString` removes specific keys from a JSON object and returns the
 * cleaned JSON string.
 * @param {any} hotelData - The `serializeFromJsonToString` function takes a `hotelData` parameter,
 * which is expected to be of type `any`. This function serializes the `hotelData` object to a string
 * after cleaning it by removing properties with keys "_" or ">".
 * @returns The `serializeFromJsonToString` function takes `hotelData` as input, cleans the data by
 * removing properties with keys "_" or ">", and then returns the cleaned data as a JSON string.
 */
export function serializeFromJsonToString(hotelData: any) {
  const cleanedData = JSON.parse(
    JSON.stringify(hotelData, (key, value) => {
      if (key === "_" || key === ">") {
        return undefined;
      }
      return value;
    })
  );
  return JSON.stringify(cleanedData);
}

/**
 * The function `deserializeFromStringToJson` takes a serialized string as input and returns the parsed
 * JSON data.
 * @param {string} serializedData - A string containing serialized JSON data that needs to be
 * deserialized into a JavaScript object.
 * @returns The function `deserializeFromStringToJson` returns the parsed JSON data after converting
 * the serialized string input into a JavaScript object.
 */
export function deserializeFromStringToJson(serializedData: string) {
  const parsedData = JSON.parse(serializedData);
  return parsedData;
}
