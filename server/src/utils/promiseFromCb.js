export default function (fn) {
  return new Promise((resolve, reject) => {
    fn((error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}
