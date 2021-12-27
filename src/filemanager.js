var fs = require('fs'),
    path = require('path');

const DIRS = [
    {
        name: 'project'
    }, {
        name: 'board'
    }, {
        name: 'reply'
    }, {
        name: 'service'
    }
];


var FileManager = (function () {

    var sUploadPath = path.join(__dirname, '..', 'public', 'uploads');

    if (!fs.existsSync(sUploadPath)) fs.mkdirSync(sUploadPath);

    DIRS.forEach(function (dir) {
        if (!fs.existsSync(path.join(sUploadPath, dir.name))) fs.mkdirSync(path.join(sUploadPath, dir.name));
    })


    /**
 * Promise all
 * @author Loreto Parisi (loretoparisi at gmail dot com)
 */
    function promiseAllP(items, block) {
        var promises = [];
        items.forEach(function (item, index) {
            promises.push(function (item, i) {
                return new Promise(function (resolve, reject) {
                    return block.apply(this, [item, index, resolve, reject]);
                });
            }(item, index))
        });
        return Promise.all(promises);
    } //promiseAll

    /**
     * read files
     * @param dirname string
     * @return Promise
     * @author Loreto Parisi (loretoparisi at gmail dot com)
     * @see http://stackoverflow.com/questions/10049557/reading-all-files-in-a-directory-store-them-in-objects-and-send-the-object
     */
    function GetFiles(dirname, parent) {
        var originPath = dirname;
        if (!parent) dirname = path.join(sUploadPath, dirname);

        return new Promise(function (resolve, reject) {
            if (!fs.existsSync(dirname)) {
                reject('no such file or directory');
            } else {
                console.log('GetFiles/readdir');
                fs.readdir(dirname, function (err, filenames) {
                    if (err) return reject(err);
                    promiseAllP(filenames,
                        function (filename, index, resolve, reject) {
                            console.log('GetFiles/fs.lstatSync');
                            if (!fs.lstatSync(path.join(dirname, filename)).isDirectory()) {
                                console.log('GetFiles/resolve');
                                resolve({
                                    name: filename,
                                    type: path.extname(path.join(dirname, filename)),
                                    size: fs.statSync(path.join(dirname, filename)).size,
                                    // path: path.join(dirname, filename),
                                    oPath: parent ? path.join(dirname, filename) : path.join('/uploads', originPath, filename),
                                    icon: (function () {

                                        var sType = path.extname(path.join(dirname, filename));
                                        sType = sType.toUpperCase();
                                        switch (sType) {
                                            case '.RAR':
                                            case '.ZIP': return 'fa-file-zip-o';
                                            case '.JPG':
                                            case '.JPEG':
                                            case '.GIF':
                                            case '.PNG':
                                            case '.BMP': return 'fa-file-image-o';
                                            case '.XLS':
                                            case '.XLXS': return 'fa-file-excel-o';
                                            case '.INI':
                                            case '.BAT':
                                            case '.CSS':
                                            case '.TXT': return 'fa-file-text-o';
                                            case '.DOC':
                                            case '.DOCX': return 'fa-file-word-o';
                                            case '.HTML':
                                            case '.HTM':
                                            case '.XML': return 'fa-file-code-o';
                                            default: return 'fa-file-o';
                                        }

                                    }())
                                });
                            } else {
                                GetFiles(path.join(dirname, filename), true)
                                    .then(function (subFiles) {
                                        resolve({
                                            name: filename,
                                            type: 'dir',
                                            size: fs.statSync(path.join(dirname, filename)).size,
                                            // path: path.join(dirname, filename),
                                            oPath: parent ? path.join(dirname, filename) : path.join('/uploads', originPath, filename),
                                            subFiles: subFiles,
                                            icon: 'fa-folder-o'
                                        });
                                    })
                                    .catch(function (error) {
                                        console.log(error);
                                        reject(error);
                                    })
                            }
                        })
                        .then(function (results) {
                            return resolve(results);
                        })
                        .catch(function (error) {
                            return reject(error);
                        });
                });
            }
        });
    }

    function DeleteFile(files, cb) {

        if (typeof cb === 'function') {
            files.forEach(function (_file) {            // var fileInfo = req.body;
                var filePath = _file.oPath.indexOf('C:') >= 0 ? _file.oPath : path.join(__dirname, '..', 'public', _file.oPath);
                console.log('DeleteFile/lstatSync');
                if (!fs.lstatSync(filePath).isDirectory()) {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                } else {
                    DeleteFile(_file.subFiles, function () {
                        fs.rmdirSync(filePath);
                    });
                }
            });

            setTimeout(cb(), 1000);
        } else {
            return new Promise(function (resolve, reject) {
                try {
                    files.forEach(function (_file) {            // var fileInfo = req.body;
                        var filePath = _file.oPath.indexOf('C:') >= 0 ? _file.oPath : path.join(__dirname, '..', 'public', _file.oPath);
                        if (_file.oPath.indexOf('fakepath') < 0) {                            
                            if (fs.existsSync(filePath)) {
                                if (!fs.lstatSync(filePath).isDirectory()) {

                                    fs.unlinkSync(filePath);

                                } else {
                                    DeleteFile(_file.subFiles, function () {
                                        fs.rmdirSync(filePath);
                                    });
                                }
                            }
                        }
                    });
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        }


        // return new Promise(function (resolve, reject) {
        //     try {

        //         files.forEach(function (_file) {
        //             // var fileInfo = req.body;
        //             var filePath = _file.oPath.indexOf('C:') >= 0 ? _file.oPath : path.join(__dirname, '..', 'public', _file.oPath);

        //             if (!fs.lstatSync(filePath).isDirectory()) {
        //                 if (fs.existsSync(filePath)) {
        //                     fs.unlinkSync(filePath);
        //                 }
        //             } else {
        //                 DeleteFile(_file.subFiles)
        //                     .then(function () {
        //                         fs.rmdirSync(filePath);
        //                     })
        //                     .catch(function (error) {
        //                         console.log(error);
        //                     })
        //             }
        //         })
        //         resolve();
        //     } catch (error) {
        //         console.log(error);
        //         reject(error);
        //     }
        // });
    }

    function DeleteFolder(tPath) {
        return new Promise(function (resolve, reject) {
            try {
                GetFiles(tPath)
                    .then(function (result) {
                        DeleteFile(result, function () {
                            fs.rmdirSync(path.join(sUploadPath, tPath));
                            resolve();
                        });
                    })
                    .catch(function (error) {
                        console.log(error);
                        reject(error);
                    })
            } catch (error) {
                reject(error);
            }
        });
    }

    function AddFile(dest, files) {
        return new Promise(function (resolve, reject) {
            try {
                var savePath = path.join(sUploadPath, dest.savepath);
                var resultFiles = [];

                console.log(dest, files);

                if (files.length) {

                    if (!fs.existsSync(savePath)) fs.mkdirSync(savePath)

                    files.forEach(function (_file) {
                        var _filePath = _file.path || path.join(__dirname, '..', 'public', _file.oPath);
                        var filename = _file.filename || _file.name;
                        if (fs.existsSync(_filePath)) {
                            var rFile = fs.readFileSync(_filePath);
                            console.log('AddFile/writeFileSync');
                            fs.writeFileSync(path.join(savePath, filename), rFile);
                            console.log('AddFile/unlinkSync');
                            fs.unlinkSync(_filePath);

                            resultFiles.push({
                                name: filename,
                                originalName: _file.filename || _file.name,
                                type: path.extname(path.join(savePath, filename)),
                                size: fs.statSync(path.join(savePath, filename)).size,
                                // path: path.join(dirname, filename),
                                oPath: path.join('/uploads', dest.savepath, filename),
                                icon: (function () {

                                    var sType = path.extname(path.join(savePath, filename));
                                    sType = sType.toUpperCase();
                                    switch (sType) {
                                        case '.RAR':
                                        case '.ZIP': return 'fa-file-zip-o';
                                        case '.JPG':
                                        case '.JPEG':
                                        case '.GIF':
                                        case '.PNG':
                                        case '.BMP': return 'fa-file-image-o';
                                        case '.XLS':
                                        case '.XLXS': return 'fa-file-excel-o';
                                        case '.INI':
                                        case '.BAT':
                                        case '.CSS':
                                        case '.TXT': return 'fa-file-text-o';
                                        case '.DOC':
                                        case '.DOCX': return 'fa-file-word-o';
                                        case '.HTML':
                                        case '.HTM':
                                        case '.XML': return 'fa-file-code-o';
                                        default: return 'fa-file-o';
                                    }

                                }())
                            })
                        }

                    });
                }
                resolve(resultFiles);

            } catch (error) {
                console.log(error);
                reject(error);
            }
        })
    }

    function MoveFile(dest, files) {
        return new Promise(function (resolve, reject) {
            try {
                console.log('파일이동');
                var movePath = path.join(sUploadPath, dest.path);
                console.log(movePath);
                if (!fs.existsSync(movePath)) fs.mkdirSync(movePath);

                files.forEach(function (f, index) {
                    var filePath = path.join(__dirname, '..', 'public', f);
                    var fileName = f.split('/');
                    fileName = fileName[fileName.length - 1];

                    if (fs.existsSync(filePath)) {
                        fs.createReadStream(filePath).pipe(fs.createWriteStream(movePath + '/' + fileName));
                        if (fs.existsSync(filePath)) { fs.unlinkSync(filePath); }
                        files[index] = dest.path + '/' + fileName;
                    } else {
                        files[index] = '';
                    }
                });

                files = files.filter(function (f) {
                    if (f !== '') {
                        return f;
                    }
                })
                console.log('이동완료');
                console.log(files);
                resolve(files);
            } catch (error) {
                console.log(error);
                reject(error);
            }
        })
    }

    function GetRemoteFile(req) {
        return new Promise(function (resolve, reject) {
            try {
                var params = req.query;

                var oRemoteFile = path.join(__dirname, '..', 'public', 'neoas', '원격접속.exe');
                var nRemoteFile = path.join(__dirname, '..', 'public', 'neoas', '' + params['user'] + '.exe');

                if (fs.existsSync(oRemoteFile)) {
                    // fs.createReadStream(oRemoteFile).pipe(fs.createWriteStream(nRemoteFile));
                    var rd = fs.createReadStream(oRemoteFile);
                    var wr = fs.createWriteStream(nRemoteFile);
                    wr.on('close', function () {
                        resolve(nRemoteFile, '' + params['user'] + '.exe');
                    });
                    rd.pipe(wr);
                }

            } catch (error) {
                reject(error);
            }
        })
    }

    return {
        dir: sUploadPath,
        GetFiles: GetFiles,
        AddFile: AddFile,
        DeleteFile: DeleteFile,
        DeleteFolder: DeleteFolder,
        MoveFile: MoveFile,
        RemoteFile: GetRemoteFile
    }

})();

module.exports = FileManager;