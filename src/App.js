import logo from './logo.svg';
import './App.css';
import { useEffect, useRef, useState } from 'react';
import Amplify from '@aws-amplify/core';
import { Storage } from 'aws-amplify';

function App() {
  const ref = useRef(null);
  const [files, setFiles] = useState([]);
  const [image, setImage] = useState(null);
  const [progress, setProgress] = useState();

  useEffect(() => {
    Amplify.configure({
      Auth: {
        identityPoolId: "ADD-YOUR-POOL-ID",
        region: "YOUR-REGION",
      },

      Storage: {
        AWSS3: {
          bucket: "YOUR-BUCKET",
          region: "YOUR-REGION",
        },
      },
    });
  }, []);

  const loadImages = () => {
    Storage.list("")
      .then((files) => {
        console.log(files);
        setFiles(files);
      })
      .catch((err) => {
        console.log(err);
      });    
  }

  useEffect(() => {
    loadImages();
   }, []);

  const handleFileLoad = () => {
    const filename = ref.current.files[0].name;
    Storage.put(filename, ref.current.files[0], {
      progressCallback: (progress) => {
        setProgress(Math.round((progress.loaded / progress.total) * 100) + "%");
        setTimeout(() => { setProgress() }, 1000);
      }
    })
      .then(resp => {
      console.log(resp);
      loadImages();
    }).catch(err => {console.log(err);});
  }

  const handleShow = (file) => {
    Storage.get(file).then(resp => {
      console.log(resp);
      setImage(resp)
    }).catch(err => { console.log(err); });
  }

  const handleDelete = (file) => {
    Storage.remove(file).then(resp => {
      console.log(resp);
      loadImages();
     }).catch(err => { console.log(err); });
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>React AWS Storage Demo</h1>
        <input ref={ref} type="file" onChange={handleFileLoad} />
        { progress}
        <table>
          <thead>
            <tr>
              <td></td>
              <td>Name</td>
              <td>Action</td>
            </tr>
          </thead>
          <tbody>
            {files.map((file,i) => (
              <tr key={file.key}>
                <td>{i}</td>
                <td>{file.key}</td>
                <td>
                  <button onClick={() => handleShow(file.key)}>Show</button>
                  <button onClick={() => handleDelete(file.key)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <img src={image} width="600"/>
      </header>
    </div>
  );
}

export default App;
