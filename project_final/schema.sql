DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS message;
DROP TABLE IF EXISTS loggeduser;

CREATE TABLE user (
    firstname VARCHAR(30) NOT NULL,
    familyname VARCHAR(30) NOT NULL,
    gender VARCHAR(6) NOT NULL,
    city VARCHAR(30) NOT NULL,
    country VARCHAR(30) NOT NULL,
    email VARCHAR(50) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    CHECK (email LIKE '%_@__%.__%')  -- Email validation constraint
);

CREATE TABLE message (
    receiver VARCHAR(50) NOT NULL,
    sender VARCHAR(50) NOT NULL,
    content VARCHAR(300) NOT NULL,
    FOREIGN KEY (receiver) REFERENCES user(email),
    FOREIGN KEY (sender) REFERENCES user(email)
);

CREATE TABLE loggeduser (
    email VARCHAR(50) NOT NULL,
    token VARCHAR(70) NOT NULL
);
