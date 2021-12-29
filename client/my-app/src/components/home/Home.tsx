import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from 'axios'

export const Home= ()=> {
  const onDrop = useCallback((acceptedFiles) => {
     acceptedFiles.forEach((file: any)  => {
      const reader = new FileReader();

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result;
        console.log(binaryStr);
      }
      reader.readAsArrayBuffer(file);
      console.log("myLog",file );

      
    });
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <p>Drag 'n' drop some files here, or click to select files</p>
    </div>
  );
}
