


const express = require("express");
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3001;

const app = express();



//Keep current state of where you are in the tree of folders
var stack_folders = [];

//Keep an original copy of stack folders 
var original_copy_stack_folders = [];

//Result end
var folders_to_send = [];

//Writing out the files directory
const files = {
    "name": "root",
    "type": "folder",
    "items": [
        {
            "name": "home",
            "type": "folder",
            "items": [
                {
                "name": "myname",
                "type": "folder",
                "items" : [
                
                    {
                        "name": "filea.txt",
                        "type": "file"
                    },
                    {
                        "name": "fileb.txt",
                        "type": "file"
                    },
                    {
                        "name": "projects",
                        "type": "folder",
                        "items": [
                            {
                                "name" : "mysupersecretproject",
                                "type" : "folder",
                                "items" : [
                                    {
                                        
                                            "name": "mysupersecretfile",
                                            "type": "file"
                                    }
                                ]

                            }
                        ]
                    }]
                }]
            }]
                
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


function modifystack(folder_items, stack_to_add,folder_clicked){
        console.log("Modify stack getting called");
    
          //Iterate through the contents of the folder clicked on
          for(i=0; i < folder_items.length; i++){
  
              var child_content = folder_items[i];
              var curr_folder_displayed ;
  
              if ("items" in child_content){
                  curr_folder_displayed = {folder_name: child_content["name"],folder_type : child_content["type"],folder_items: child_content["items"], parent: folder_clicked};
              }
              //Adding file to stack
              else{
                  curr_folder_displayed = {folder_name: child_content["name"],folder_type : child_content["type"],parent: folder_clicked, folder_items: []};
              }
  
              folders_to_send.push({
                  folder_name: child_content["name"],
                  folder_type :  child_content["type"],
              });
              //add to the stack
              stack_to_add.push(curr_folder_displayed);
          }    

}

app.get("/path/:mypath", (req, res) => {

    var folder_clicked = req.params.mypath;

    //Gets the top element of the stack 
    var top_element = stack_folders[stack_folders.length - 1];



    //Return the sub child contents
    if (top_element.folder_name == folder_clicked){
            //Return the sub child contents
          
             var parent_folder_contents = top_element.folder_items 
            modifystack(parent_folder_contents,stack_folders,folder_clicked);
            res.json(folders_to_send);
    }


    //Start looking for the folder clicked  on in the stack 
    else{
        //Keep a copy of the original list
        original_copy_stack_folders = stack_folders;

       

        let parent_not_found = false;
        //remove the top element in the stack
        while (top_element.parent != folder_clicked){

            console.log("Remove the top element", top_element );

            //If found the folder, i.e. it's not set as a parent folder, a subdirectory clicked on of multiple folders
            if (top_element.folder_name == folder_clicked){
                //Get the items of the folder clicked on and append it to the oiginal stack since we want to maintain the current 
                //routing

                var child_items = top_elements.folder_items;
                console.log("The current routing on else statement", original_copy_stack_folders);

                modifystack(child_items, original_copy_stack_folders,folder_clicked);
                stack_folders = original_copy_stack_folders;
                parent_not_found = true;
                break;
            }

            stack_folders.pop();
            top_element = stack_folders[stack_folders.length - 1];

        }

        //Parent not found
        if (parent_not_found){
            res.json(folders_to_send);
        }
        //Parent found so display that path along with the child directories;
        else{

            folders_to_send = [];
            
            top_element = stack_folders[stack_folders.length - 1];

            while (top_element.folder_name != folder_clicked){
                stack_folders.pop();
                top_element = stack_folders[stack_folders.length - 1];
            }

            for(i=0; i < stack_folders.length; i++){
                    folders_to_send.push({folder_name: stack_folders[i].folder_name, folder_type: stack_folders[i].folder_type});
            }
            res.json(folders_to_send);
        }

    }
    
    
});



//Original path for the when the page first gets loaded displays the root directory there
app.get("/path", (req, res) => {
   
    folders_to_send = [];
    //Keep current state of where you are in the tree of folders
    stack_folders = [];

    original_copy_stack_folders = [];

    current_file_directory = files["items"];

    var initial_result = {folder_name: files["name"],folder_type : files["type"],folder_items: files["items"]};

    //Home
    stack_folders.push(initial_result);

    //The folder to send without items
    folders_to_send.push({folder_name: files["name"],
    folder_type : files["type"],
    });

    //Pushes the first element here 
    res.json(folders_to_send);

    });


app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
