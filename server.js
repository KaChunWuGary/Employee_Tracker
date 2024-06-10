// Import and require mysql2
const mysql = require('mysql2/promise');
const inquirer = require('inquirer');
const fs = require('fs');


async function main() {
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '@Aegisvindico1!'
  });

  const main_menu = {
    type: 'list',
    message: 'What would you like to do?',
    name: 'main_menu',
    choices: [
      'View All Employees', 
      'Add Employee', 
      'Update Employee Role',
      'View All Roles',
      'Add Role', 
      'View All Departments',
      'Add Department',
      'Quit'
    ],
    loop: true,
  };

  try {
    const schemaQueries = fs.readFileSync('./db/schema.sql', 'utf8').split(';');
    for (let query of schemaQueries) {
      if (query.trim() !== '') {
        db.query(query);
        console.log('Schema Query executed successfully.');
      }
    }

    const seedQueries = fs.readFileSync('./db/seeds.sql', 'utf8').split(';');
    for (let query of seedQueries) {
      if (query.trim() !== '') {
        db.query(query);
        console.log('Seed Query executed successfully.');
      }
    }

    await startInquirer();
  } catch (err) {
    console.error(err);
  } 

  async function startInquirer () {
  //inquirer prompts start here
    await inquirer.prompt(main_menu).then(response => handlingUserResponse1(response));
  }

  //this allows us to handle main menu selections
  async function handlingUserResponse1 (response) {
    //reponse goes to here
    const userReponse = response.main_menu;
    switch (userReponse) {
      case 'View All Employees':
        await viewAllEmployees();
        backtoMainMenu();
        break;
      case 'View All Roles':
        await viewAllRoles();
        backtoMainMenu();
        break;
      case 'View All Departments':
        await viewAllDepartments();
        backtoMainMenu();
        break;
      case 'Add Employee':
        await addEmployeePrompts();
        backtoMainMenu();
        break;
      case 'Update Employee Role':
        await updateEmployeeRolePrompts();
        backtoMainMenu();
        break;
      case 'Add Role':
        await addRolePrompt();
        backtoMainMenu();
        break;
      case 'Add Department':
        await addDepartmentPrompt();
        backtoMainMenu();
        break;
      case 'Quit':
        db.end();
        process.exit();
      default:
        console.log('Invalid choice.');
        backtoMainMenu();
    }
    
  }
  //function to go back to main menu
  async function backtoMainMenu () {
    inquirer.prompt(main_menu).then(response => handlingUserResponse1(response));
  }

  // Function to view all employees from the database
  async function viewAllEmployees() {
    const [rows, fields] = await db.query('SELECT * FROM employee');
    console.table(rows);
  }
  // Function to view all departments from the database
  async function viewAllDepartments() {
    const [rows, fields] = await db.query('SELECT * FROM department');
    console.table(rows);
  }
  // Function to view all roles from the database
  async function viewAllRoles() {
    const [rows, fields] = await db.query('SELECT * FROM employee_role');
    console.table(rows);
  }

  // Function to view all employees from the database
  async function addEmployeePrompts(){
    //getting the correct choices for the list in the prompt
    const [rows] = await db.query('SELECT title FROM employee_role');
    const roles = await rows.map((row) => row.title);  
    const [rows2] = await db.query('SELECT * FROM employee');
    const employees = await rows2.map((row) => `${row.first_name} ${row.last_name}`);
    employees.push('none')

    //prompting
    await inquirer.prompt([
      {
        type: 'input',
        message: 'What is the first name of the employee?',
        name: 'first_name',
      },
      {
        type: 'input',
        message: 'What is the last name of the employee?',
        name: 'last_name',
      },
      {
        type: 'list',
        message: 'What is the role of the employee?',
        name: 'employee_role',
        choices: roles,
        filter: function (input) {
          return (roles.indexOf(input) + 1)
        },
      },
      {
        type: 'list',
        message: 'What is name of the manager of the employee?',
        name: 'employee_manager',
        choices: employees,
        //this allows me to select the manager based on the id instead of the name
        filter: function (input) {
          return (employees.indexOf(input) + 1) 
        },
      }
    ]
    
    ).then((answers) =>
      addEmployee(answers.first_name, answers.last_name, answers.employee_role, answers.employee_manager)
    );

  }
  //adds employee to the database
  async function addEmployee(first_name, last_name, role_id, manager_id) {
    if (manager_id == 0){
      manager_id = null;
    }
    const query = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
    await db.query(query, [first_name, last_name, role_id, manager_id]);
    console.log("Employee added successfully.");
  }

  //update employee role prompts
  async function updateEmployeeRolePrompts(){
    const [rows, fields] = await db.query('SELECT * FROM employee');
    const employees = await rows.map((row) => `${row.first_name} ${row.last_name}`);
    
    const [rows2] = await db.query('SELECT title FROM employee_role');
    const roles = await rows2.map((row) => `${row.title}`);

    //prompting
    await inquirer.prompt([
      {
        type: 'list',
        message: 'What is name of the employee?',
        name: 'employee_name',
        choices: employees,
        //this allows me to select the employee based on the id instead of the name
        filter: function (input) {
          return (employees.indexOf(input) + 1) 
        },
      },
      {
        type: 'list',
        message: 'Which is the role the employee will be moved to?',
        name: 'role_employee',
        choices: roles,
        //this allows me to select the role based on the id instead of the name
        filter: function (input) {
          return (roles.indexOf(input) + 1) 
        },
      }
      
    ]
    ).then((answers) =>
        updateEmployeeRole(answers.employee_name, answers.role_employee)
    );
  };
  //update employee role to database
  async function updateEmployeeRole(employee_id,role_id) {
    const query = `UPDATE employee SET role_id = ? WHERE id = ?`;
    await db.query(query, [role_id, employee_id]);
    console.log('Employee role updated.');
  };

  //prompts to add a role to the database
  async function addRolePrompt(){
    //getting the correct choices for the list in the prompt
    const [rows] = await db.query('SELECT * FROM department');
    const department = await rows.map((row) => `${row.department_name}`);
    //prompting
    await inquirer.prompt([
      {
        type: 'input',
        message: 'What is the title of the role?',
        name: 'role_title',
      },
      {
        type: 'number',
        name: 'salary_amount',
        message: 'What is the salary of the role(numbers only)?',
      },
      {
        type: 'list',
        message: 'What department does this role belong to?',
        name: 'role_department',
        choices: department,
        filter: function (input) {
          return (department.indexOf(input) + 1)
        },
      },
    ]
    
    ).then((answers) =>
      addRole(answers.role_title, answers.salary_amount, answers.role_department)
    );

  }
  //adds role to database
  async function addRole(title, salary_amount , department_id) {
    const salary = parseInt(salary_amount);
    const query = `INSERT INTO employee_role (title, salary, department_id) VALUES (?, ?, ?)`;
    await db.query(query, [title, salary, department_id]);
    console.log('Employee role created.');
  }


  //prompt to add a department to the database
  async function addDepartmentPrompt(){
    await inquirer.prompt([
      {
        type: 'input',
        message: 'What is the department name?',
        name: 'department_name',
      },
    ]
    ).then((answers) =>
      addDepartment(answers.department_name)
    );
  }
  //adds department to database
  async function addDepartment(department_name) {
    const query = `INSERT INTO department (department_name) VALUES (?)`;
    await db.query(query, [department_name]);
    console.log('Department created.');
  }
} 

main().catch(err => console.error(err));