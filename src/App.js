import React from 'react';
import './App.css';
import JSZip from "jszip";
import { saveAs } from 'file-saver';

const EXTENSION = "txt";

export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: "Nothing uploaded yet. So here is the current time: " + new Date().toString(),
        }
    }

    upload = (e) => {

        try {
            e.preventDefault();
            const {target} = e;
            const {files} = target;
            if (files.length>1) {
                console.log("I will only process first file.",)
            }
            const size = files[0].size;
            if (size > 1000000) {
                console.log("uploading large file.")
            }

            let data;

            let localRes = null;
            const promise = new Promise(resolve => {
                localRes = resolve;
            });

            JSZip.loadAsync(files[0]).then(function (zip) {
                Object.keys(zip.files).forEach(function (filename) {
                    zip.files[filename].async('ArrayBuffer').then(function (uint8array) {
                        data = new TextDecoder("utf-8").decode(uint8array);
                        localRes()
                    })
                })
            });

            promise.then(
                () => {
                    this.setState({
                        data,
                    })
                }
            );

        } catch (err) {
            console.error("upload error", err);
        }
    };

    download = async (filenameBasic) => {
        try {
            const data = this.state.data;
            const filename = filenameBasic + "." + EXTENSION;

            let zip = new JSZip();

            zip.file(filename, JSON.stringify(data));
            if(JSZip.support.uint8array) {
                if(data.length >= 14000) {
                    console.log( `Compressing large file`, `please wait...` )
                }
                zip.generateAsync({type: "blob", compression: "DEFLATE"})
                    .then(blob => saveAs(blob, filenameBasic + ".zip"))
                    .then(() => console.log( `File download successful`, filename)
                    )
            } else {
                console.log('error', `Download failed`, `JSZip doesn't support unit8array.`)
            }
        } catch(e) {
            console.error("download error",e);
        }
    };


    render() {
        return (
            <div className="App">
                <h2> Upload and download (and extract) zip files using React + JSZip + file-saver libraries.</h2>
                <div style={{display: "flex", margin: "0 auto", flexDirection: "column", alignItems: "flex-start", width: "min-content"}}>
                    <div style={{display: "inline-flex"}}>Upload:&nbsp;
                        <input type="file" name={"upload"} id={"upload"}
                            onChange={(e) => this.upload(e)}/>
                    </div>

                    <div>Download:&nbsp;
                        <button type="submit" name={"download"} id={"download"}
                            onClick={() => this.download("download")}>Download</button>
                    </div>
                </div>
                <h2>Data:</h2>

                <p> {this.state.data}</p>
            </div>
        );
    }
}