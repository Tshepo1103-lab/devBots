# Angular Project with ASP.NET Boilerplate (ABP)

This project is an Angular application integrated with ASP.NET Boilerplate (ABP). It provides a robust foundation for building scalable and maintainable web applications.

## Prerequisites

Before running the project, make sure you have the following installed:

- **Node.js**: v14.x or higher
- **NPM (Node Package Manager)**: Comes with Node.js
- **Angular CLI**: v12.x or higher
- **ASP.NET Core SDK**: v5.x or higher
- **SQL Server**: Required for the backend API

## Getting Started

### 1. Clone the Repository

Clone the repository to your local machine using the following command:

```bash
git clone https://github.com/your-repo-name.git
```

### 2. Create a new database

Create a new SQL Server database. Copy the server name and database name, as these will be used in your connection string.

### 2. Run your backend

- Open the ASP.NET Core solution in Visual Studio.

- Set app.Web.Host as the startup project.

- Go to your app settings and configure your connection string
   `"Default": "Server=YourServerName; Database=YourDb; Trusted_Connection=True; TrustServerCertificate=True;"`
-  Click on `Tools> Nugget Package Manager`
-  Select  `EF Core` as the default project
-  Run the following command
-  add-migration `migrationName`
-  Once that is succesfull run `update-database`
-  Once that is done your can run your entire project

  ### 3. Run your frontend

  - Open the angular folder
  - open  `new terminal`
  - execute the following command `npm i -f`
  - execute  `npm run start ` to start the application
  - A localhost link will be provided, open the link\
  - Wala!, you have your application : )



## Additional Information 

#### To log in as the admin use the following credentials:

`username: admin
password: 123qwe`
  - 

  additionally you can register a new user and user the credentials to log in
  


