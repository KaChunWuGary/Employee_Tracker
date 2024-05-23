CREATE TABLE department(
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_name VARCHAR(30)
);

CREATE TABLE employee_role(
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR (30),
  salary DECIMAL,
  department_id INT,
  FOREIGN KEY (department_id)
  REFERENCES department(id)
  ON DELETE SET NULL
);

CREATE TABLE employee(
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30),
  last_name VARCHAR(30),
  role_id INT,
  FOREIGN KEY (role_id)
  REFERENCES employee_role(id)
  ON DELETE SET NULL,
  manager_id INT 
);

INSERT into department (department_name)
  VALUES 
    ('Gaming'),
    ('Sports'),
    ('Media');

INSERT into employee_role (title,salary,department_id)
  VALUES 
    ('Storytelling',100000,1),
    ('Balance Team',75000,1),
    ('Events Planner',65000,2),
    ('Coaches',100000,2),
    ('Social Media Outreach',70000,3),
    ('Sponsors lobbying',72000,3);

INSERT into employee(first_name,last_name,role_id)
  VALUES 
    ('John','Smith',1),
    ('Jane','Doe',2),
    ('Mary','Poppins',3),
    ('Micheal', 'Brown',4),
    ('Jar Jar', 'Binks',5),
    ('Tony', 'Stark',6);


