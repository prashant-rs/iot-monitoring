
Frontend:                                                                   
Tech Stack

React 18 (UI library)                                                                  
Vite (Build tool)                                                                  
TanStack Query (Data fetching)                                                                     
Tailwind CSS (Styling)                                                                             
shadcn/ui (UI components)                                                                                
Recharts (Data visualization)                                                       

cd ../frontend                                                                          
npm install                                                                            
npm run dev

Open http://localhost:5173                                                                                                                        
                                                                                                                             
                                                                                                                                                                                                                                                              
Backend :

Required Software

Node.js (v24.11.1 or higher)                          
MySQL (v8.0 or higher)                                      
npm (comes with Node.js)

Verify installation: npm --version

System Requirements

Operating System: Windows 10/11, macOS, or Linux                                      
RAM: 4GB minimum, 8GB recommended                                                     
Disk Space: 500MB free space


Tech Stack
                                                                         
Node.js v24.11.1                                                                  
Express.js (Web framework)                                                        
MySQL (Database)                                                       
Native fetch API (HTTP requests)                                            


npm install                                                                
# Edit .env with your MySQL credentials   

My .env file

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Prashant@1234
DB_NAME=iot_monitoring
DB_PORT=3306

# Server Configuration
PORT=3000

# Simulation Configuration
SIMULATION_INTERVAL=60000




npm run init-db (Run the database migration script:) OR Database file is available inside Script folder 
path: backend/scripts/initDatabase.js (run this file using command = node initDatabase.js)                    


npm run dev
