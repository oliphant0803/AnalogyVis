import fs from 'fs';
import { parse } from 'fast-csv';
import ObjectsToCsv from 'objects-to-csv';

const inputFile = 'pilot.csv'; // Input CSV file
const outputFile = 'filtered_pilot.csv'; // Output CSV file

// Function to process the CSV with preset header
const processCsv = async () => {
  const rows = [];

  // Define the preset columns you want to extract
  const presetColumns = ['ResponseId', 'PROLIFIC_PID', 'ChartType'];

  // Read the CSV file
  fs.createReadStream(inputFile)
    .pipe(parse({ headers: true, maxRows: 1 })) // Skip the first 3 rows, and read only the first row (header)
    .on('data', (row) => {
      // Extract the header from the first row
      const headers = Object.keys(row);
      console.log('Extracted Headers:', headers); // Optional: Log the extracted headers
    })
    .on('end', () => {
      // After extracting the headers, now process the rest of the CSV to filter for the required columns
      fs.createReadStream(inputFile)
        .pipe(parse({ headers: true, skipLines: 3 })) // Skip the first 3 rows and use the 4th row as header
        .on('data', (row) => {
          // Extract the required columns based on the preset columns
          const filteredRow = {};
          presetColumns.forEach((column) => {
            if (row[column]) {
              filteredRow[column] = row[column];
            }
          });
          if (Object.keys(filteredRow).length > 0) {
            rows.push(filteredRow);
          }
        })
        .on('end', async () => {
          if (rows.length > 0) {
            // Convert the rows into a new CSV file
            const csv = new ObjectsToCsv(rows);
            await csv.toDisk(outputFile);
            console.log('Filtered CSV has been saved to:', outputFile);
          } else {
            console.log('No rows were extracted. Please check the CSV content.');
          }
        })
        .on('error', (error) => {
          console.error('Error reading CSV:', error);
        });
    })
    .on('error', (error) => {
      console.error('Error reading CSV header:', error);
    });
};

// Run the function
processCsv();






// // npm install --save jimp
// // npm install --save d3-node

// // run npm install if running the code for the first time. 
// import * as Jimp from 'jimp';;
// import fs from 'fs';
// import { parse } from 'fast-csv';
// import ObjectsToCsv from 'objects-to-csv';
// import * as d3 from 'd3';

// //function to test if question is a 'core VLAT question' , 
// function testQuestionID(input) {
//     let regex = /.Q[0-9]_?[0-9]?$/;
//     return regex.test(input);
// }

// // array of participant / questions that are wrong for qualitative analysis and tagging
// let toTag = [];
// //object to store answer key
// let answers = {};
// //array to store in qualtrics export
// let data = []

// //array to store object version of qualtrics export
// let objData = []

// //object to store question prompt to overlay on images 
// let questionMap = {};

// //keep track of which participants are being processed in this directory. 
// let participants = new Set();

// //set up a time filter if you only want participants after a certain date
// let timeFilter = Date.parse('2023-08-24 20:00:00');

// //directory where the processing is happening
// let dir = "/Users/h2o/Documents/Projects/AnalogyVis/analysis";

// let files = fs.readdirSync(dir)
// let dataFile = files.filter(f => f.includes('pilot.csv'))[0];
// let annotationFolder = dir + '/' + files.filter(f => f.includes('annotations'))[0];

// console.log('data file', dataFile, 'annotationFolder', annotationFolder)

// //read in answer key from google sheets
// // d3.csv('/Users/h2o/Documents/Projects/AnalogyVis/analysis/pilot.csv')
// // // d3.csv('https://docs.google.com/spreadsheets/d/e/2PACX-1vTV7q_PgMiU-Ga7oLNm7kyfDyejGg1YTn3vexGKCsXBKs-bkiS4NqXBUl54p1h078IHZcC4QIJ6iq-H/pub?gid=0&single=true&output=csv')
// //     .then(data => {
// //         data.map(d => {
// //             answers[d['Question ID']] = d
// //         })
        
// //         // console.log('data', data)
// //         loadResults();
// //     })
// loadResults();


// function loadResults() {
//     fs.createReadStream(dir + '/' + dataFile)

//         .pipe(csv.parse({ headers: false }))
//         .on('error', error => console.error(error))
//         .on('data', row => data.push(row))
//         .on('end', async () => {



//             console.log(data.length + ' rows in original data')
//             let questionPrompts = data[1];

//             // console.log(questionPrompts)
//             data[0].map((id, i) => {
//                 if (testQuestionID(id)) {
//                     //remove _ from question prompt
//                     let cleanId = id.split('_')[0]
//                     //bug in qualtrics export, doesn't have the question text for this one since it's a standard library question
//                     if (cleanId == 'CCQ1')
//                         questionPrompts[i] = 'In which state was the unemployment rate the highest?';
//                     questionMap[cleanId] = questionPrompts[i].replace(/(\r\n|\n|\r)/gm, "").split('?')[0]
//                 }
//             })
//             // console.log(questionMap)

//             // console.log(data[2])
//             data.splice(1, 2)// remove rows 2 and 3
//             let headers = data[0];

//             data.map((d, i) => {
//                 let obj = {}
//                 if (i > 0) {
//                     // if (i ==1 ) console.log('d',d)
//                     d.map((dd, i) => {
//                         obj[headers[i]] = dd
//                     })
//                     objData.push(obj)
//                 }

//             })


//             //save filtered data
//             let filteredData = objData.filter(d => Date.parse(d.StartDate) >= timeFilter && Number(d['Duration (in seconds)']) > 500);
//             console.log(filteredData.length + ' rows in filtered data')

//             //count how many people per chart type; 
//             let chartTypes = Object.keys(filteredData[0]).filter(k => k.includes('chart_'));

//             let chartCount = {};
//             chartTypes.map(c => {
//                 chartCount[c] = filteredData.filter(d => d[c] == 'True').length
//             })
//             console.log(chartCount)


//             const csv = new ObjectsToCsv(filteredData);



//             // Save to file:
//             csv.toDisk(dir + '/ ' + 'filtered_data.csv');


//             const files = getFiles(annotationFolder);


//             // console.log(files)
//             // await imageOverlay(files[20],dir);





//             await Promise.all(files.map(async (file, i) => {
//                 // if (file.includes('SAQ2')){
//                     await imageOverlay(file, dir,true);   
//                 // }
                
//             }))
//             console.log('processed ', participants.size, ' files')

//             // console.log(toTag)

//             //sort alphabetically by filename to match the order in the annotations folder.
//             toTag.sort((a, b) => a.sketchImage > b.sketchImage ? 1 : -1)
//             const tagCsv = new ObjectsToCsv(toTag);



//             // Save to file:
//             tagCsv.toDisk(dir + '/ ' + 'toTag.csv');
//         });
// }



// async function imageOverlay(image, dir,exportFig=true) {


//     //e.g. image =  'vlat_annotations/SB100Q3 - annotate/R_bQabCwyyuq5L81b_signature.png'

//     let imagePath = image.split('/')
//     let fileName = imagePath.pop();
//     // e.g. fileName = 'R_bQabCwyyuq5L81b_signature.png'

//     //  console.log(fileName) 

//     // if file is not a signature.png exit
//     if (!fileName || !fileName.includes('signature'))
//         return;

//     let id = fileName.split('_signature')[0];
//     // e.g id = 'R_bQabCwyyuq5L81b'

//     let question = imagePath.pop().split('-')[0].trim();
//     //e.g question = SB100Q3


//     //look for 'ResponseId' to find participant data 
//     let participantData = objData.filter(d => d['ResponseId'] == id.trim())[0];
//     let keys = Object.keys(participantData);

//     //filter out by time 
//     if (Date.parse(participantData.StartDate) >= timeFilter) {
//         // console.log(participantData.PROLIFIC_PID)
//         participants.add(participantData.PROLIFIC_PID); //count how many participants are being processed
//         let answerKey = keys.filter(k => k.trim() == question);
//         let answer;
//         //question has two parts _1 and _2
//         if (answerKey.length == 0) {
//             answerKey = keys.filter(k => k.includes(question + '_'));
//             answer = answerKey.reduce((accumulator, currentValue) => accumulator + ' / ' + participantData[currentValue], '');
//         } else {
//             answer = participantData[answerKey[0]];
//         }

//         // console.log(answerKey, answer)


//         let explainKey = keys.filter(k => k.includes(question) && k.includes('textbox'))
//         let explanation = participantData[explainKey];

//         // console.log(participantData)

//         // console.log(explainKey,explanation)
//         let chartType = question.split('Q')[0];
//         //e.g chartType = SB100



//         // If chart type has less than two letters (a trial) exit
//         if (chartType.length < 2)
//             return;
        
//         let outputImage = question + '_' + id + '.png'

//         let tagObj = {}
//         tagObj['PROLIFIC_PID'] = participantData['PROLIFIC_PID'];
//         tagObj['chart'] = chartType
//         tagObj['question'] = question
//         tagObj['sketchImage'] = outputImage
//         // tagObj['prompt'] = questionMap[question.trim()]
//         // tagObj['answer'] = answerObj.Answer
//         // tagObj['explanation'] = explanation
//         tagObj['tag'] = '';
//         tagObj['designGuidelines'] = '';

//         toTag.push(tagObj)

//         // console.log(fileName)
//         // Reading annotation Image
//         // console.log(image.trim())
       
//         if (exportFig){
//             // console.log(image.trim())
//             let annotation = await Jimp.read(image.trim());
//             // console.log('success 1')

//             // // Reading original chart
//             // console.log('charts/' + chartType + '.png')
//             // console.log('chart', chartType)

//             let chart = await Jimp.read('charts/' + chartType + '.png');
//             // console.log('success 2')
//             let background = await Jimp.read('charts/background.png');

//             // console.log('success 3')

//             // let width = chart.bitmap.width; //  width of the image
//             // let height = chart.bitmap.height; // height of the image


//             let width = 860 //set all images to the same width

//             let margin = 150;
//             chart = chart.resize(width, Jimp.AUTO);
//             let height = chart.bitmap.height; // height of the image


//             annotation = annotation.resize(width, height); // Resizing annotation image to match the underlying chart
//             background = background.resize(width, height + margin); // Resizing background image to make room for the question prompt, the answer, and the rationale

//             //overlay annotation on chart
//             chart.composite(annotation, 0, 0, {
//                 mode: Jimp.BLEND_SOURCE_OVER,
//                 opacityDest: 1,
//                 opacitySource: 1
//             })

//             //overlay chart on background
//             background.composite(chart, 0, margin, {
//                 mode: Jimp.BLEND_SOURCE_OVER,
//                 opacityDest: 1,
//                 opacitySource: 1
//             })

//             //add question prompt to image

//             const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
//             // console.log(questionMap[question.trim()])
//             let prompt = question + ": " + questionMap[question.trim()]
//             let maxCharacters = 100;
//             // console.log(typeof prompt)
//             if (prompt) {
//                 background.print(font, 10, 20, prompt.slice(0, maxCharacters))
//                 if (prompt.length > maxCharacters)
//                     background.print(font, 10, 40, prompt.slice(maxCharacters))
//             } else {
//                 console.log('no prompt for ', question.trim())
//             }

//             //add correct answer and acceptable margin 

//             // console.log(question,answers[question])
//             let answerObj = answers[question];
//             let range = ' (' + answerObj['Acceptable range min'] + '/' + answerObj['Acceptable range max'] + ')'
//             background.print(font, 10, 40, 'correct answer: ' + answerObj.Answer + range)


//             //add user answer and explanation 
//             background.print(font, 10, 70, 'response: ' + answer)
//             if (explanation) {
//                 background.print(font, 10, 90, 'explanation: ' + explanation.slice(0, maxCharacters))
//                 if (explanation.length > maxCharacters)
//                     background.print(font, 10, 110, explanation.slice(maxCharacters))

//             }

//             await background.writeAsync(dir + '/composite_annotations/' + outputImage);
//         }

//     }


// }


// // Recursive function to get files
// function getFiles(dir, files = []) {
//     // Get an array of all files and directories in the passed directory using fs.readdirSync
//     const fileList = fs.readdirSync(dir);
//     // Create the full path of the file/directory by concatenating the passed directory and file/directory name
//     for (const file of fileList) {
//         const name = `${dir}/${file}`;
//         // Check if the current file/directory is a directory using fs.statSync
//         if (fs.statSync(name).isDirectory()) {
//             // If it is a directory, recursively call the getFiles function with the directory path and the files array
//             getFiles(name, files);
//         } else {
//             // If it is a file, push the full path to the files array
//             files.push(name);
//             //console.log(name) 
//         }
//     }
//     return files;
// }



