import { readdir } from "node:fs/promises";
import path from "path";

/**
 *
 * @param category "male" | "female"
 * @returns Promise
 */
export async function getRandomMemojiImage(category: "male" | "female") {
  const imageDir = path.resolve(__dirname, `../../public/images/${category}`);
  let randomImage;
  try {
    const files = await readdir(imageDir);
    randomImage = `images/${category}/${
      files[Math.floor(Math.random() * files.length)]
    }`;
    console.log("random image generated", randomImage);
    return randomImage;
  } catch (err) {
    console.error(err);
  }
  return "";
}

export async function generateRandomImages(category: "male" | "female") {
  let response = {};
  response = await getRandomMemojiImage(category)
    .then((randomImage) => {
      return randomImage;
    })
    .catch((err: Error) => {
      console.log(err);
      const error = new Error();
      error.message = `${err}`;
      throw error;
    });

  return response;
}
