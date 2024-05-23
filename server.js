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
      'Add Roles', 
      'View All Departments',
      'Add Departments',
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
        await backtoMainMenu();
        break;
      case 'Update Employee Role':
        break;
      case 'Add Role':
        break;
      case 'Add Departments':
        break;
      case 'Quit':
        db.end();
        break;
      default:
        console.log('Invalid choice.');
    }
    
  }
  async function backtoMainMenu () {
    inquirer.prompt(main_menu).then(response => handlingUserResponse1(response));
  }

  // Function to view all employees from the database
  async function viewAllEmployees() {
    const [rows, fields] = await db.query('SELECT * FROM employee');
    console.log(rows);
  }
  // Function to view all departments from the database
  async function viewAllDepartments() {
    const [rows, fields] = await db.query('SELECT * FROM department');
    console.log(rows);
  }
  // Function to view all roels from the database
  async function viewAllRoles() {
    const [rows, fields] = await db.query('SELECT * FROM employee_role');
    console.log(rows);
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
        message: 'What is the first name of the employee',
        name: 'first_name',
      },
      {
        type: 'input',
        message: 'What is the last name of the employee',
        name: 'last_name',
      },
      {
        type: 'list',
        message: 'What is the role of the employee',
        name: 'employee_role',
        choices: roles,
        filter: function (input) {
          return (roles.indexOf(input) + 1)
        },
      },
      {
        type: 'list',
        message: 'What is name of the manager of the employee',
        name: 'employee_manager',
        choices: employees,
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
  }
}

main().catch(err => console.error(err));