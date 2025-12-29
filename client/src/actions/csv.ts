"use server";

import csv from "csv-parser";
import { Readable } from "stream";

export async function readCSVFile<T extends object = object>(file: File) {
  return new Promise<T[]>(async (resolve, reject) => {
    const fileContent = await file.text();
    const reader = new Readable({
      read() {
        this.push(fileContent);
        this.push(null);
      },
    });

    const csvData: object[] = [];

    reader
      .pipe(csv())
      .on("data", function (data) {
        if (typeof data === "object") {
          csvData.push(data);
        }
      })
      .on("close", () => {
        if (csvData.length === 0) {
          reject(new Error("No data in CSV file"));
        }

        resolve(csvData as T[]);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

export async function getCSVHeaders(file: File) {
  return new Promise<string[]>(async (resolve, reject) => {
    const fileContent = await file.text();
    const reader = new Readable({
      read() {
        this.push(fileContent);
        this.push(null);
      },
    });

    reader
      .pipe(csv())
      .on("headers", function (data) {
        resolve(data);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}
