DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS message;

CREATE TABLE user (
    firstname varchar(30) NOT NULL,
    familyname varchar(30) NOT NULL,
    gender varchar(6) NOT NULL,
    city varchar(30) NOT NULL,
    country varchar(30) NOT NULL,
    email varchar(40) PRIMARY KEY NOT NULL,
    password varchar(40) NOT NULL 
);

CREATE TABLE message (
    user_email varchar(30) NOT NULL,
    sender_email varchar(30) NOT NULL,
    content varchar(300) NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_email) REFERENCES user(email),
    FOREIGN KEY (sender_email) REFERENCES user(email)
);





INSERT INTO user (firstname, familyname, gender, city, country, email, password) VALUES ("emil", "lööf", "man", "linkan", "swe", "mail@mail", "password")