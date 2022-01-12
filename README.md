# Web_Scrapping_WC

command to run --> // node WebScrapping.js --excel=worldCup.csv --dataDir=worldCup --source="https://www.espncricinfo.com/series/icc-cricket-world-cup-2019-1144415/match-results"
Libraries used ==> minimist --> to set the input format.
                   axios    --> to download html from our targeted webpage
                   jsdom    --> used to parse and interact with the downloaded html just like a browser.
                   excel4node-->processes data is then saved in forms of excel worksheets.
                   pdf-lib   -->creating files and folders from the excel sheets.
                   fs        --> provide us useful functionalities for interacting with files.
                   path      --> to use our program in various system , we need some alteration in files addresses.
                   
 
Description of program ==> it download the data from web . Process it and save useful information in excel and then create files and folders to store this data.

//Template.pdf is required for running the program .
                   
