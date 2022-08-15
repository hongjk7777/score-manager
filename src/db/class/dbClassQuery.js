import db from "../dbConfig.js";

function addClassToDB(className, dayStr) {
    db.query("USE classdb");
    db.query(`INSERT INTO classes(name, class_day) VALUES('${className}', '${dayStr}')`);
}

function getClassId(className) {
    return new Promise(resolve => {
        db.query(`USE classdb`);
        db.query(`SELECT id FROM classes WHERE name = '${className}'`, function(err, aClass) {
            if(err) {
                console.log("Failed to load class id with class name");
                console.log(err);
                resolve(0);
            } else{
                resolve(aClass[0].id);
            }
        })
    })
}

function deleteClassDB(classId) {
    return new Promise(resolve => {
        db.query(`DELETE FROM exams WHERE class_id = ${classId}`, function(err) {
            if(err) {
                console.log(err);
                resolve(false);
            }
            db.query(`DELETE FROM total_exams WHERE class_id = ${classId}`, function(err) {
                if(err) {
                    console.log(err);
                    resolve(false);
                }
                
                db.query(`DELETE FROM students WHERE class_id = ${classId}`, function(err) {
                    if(err) {
                        console.log(err);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            });
        });
    })
}

function deleteClassFromDB(classId) {
    return new Promise(resolve => {
        db.query("USE classdb");
//     delete from exams where class_id = 5;
// delete from students where class_id = 5;
// delete from total_exams where class_id = 5;
// delete from classes where id = 5;
        db.query(`DELETE FROM exams WHERE class_id = ${classId}`, function(err) {
            if(err) {
                console.log(err);
                resolve();
            }
            db.query(`DELETE FROM students WHERE class_id = ${classId}`, function(err) {
                if(err) {
                    console.log(err);
                    resolve();
                }
                db.query(`DELETE FROM total_exams WHERE class_id = ${classId}`, function(err) {
                    if(err) {
                        console.log(err);
                        resolve();
                    }
                    db.query(`DELETE FROM classes WHERE id = ${classId}`, function(err) {
                        if(err) {
                            console.log(err);
                            resolve();
                        }

                        resolve();
                    });
                });
            });
        });
    });
    
}

export { addClassToDB, getClassId, deleteClassDB, deleteClassFromDB }
