DROP DATABASE IF EXISTS management_db;
CREATE DATABASE management_db;

USE management_db;

CREATE TABLE department(
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30)
);

CREATE TABLE role(
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR (30),
  salary DECIMAL,
  department_id INT
  FOREIGN KEY (department)
  REFERENCES department(id)
  ON DELETE SET NULL
);
CREATE TABLE employee(
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30),
  last_name VARCHAR(30),
  role_id INT
  FOREIGN KEY (role)
  REFERENCES role(id)
  ON DELETE SET NULL
  manager_id INT 
)