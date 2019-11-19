const gulp = require('gulp');
//import functions
require('./build/functions');
// Read TIBCO cloud properties...
const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('tibco-cloud.properties');
const props = properties.path();


// Function to build the cloud starter
function build() {
  return new Promise(function (resolve, reject) {
    log('INFO', 'Building... ' + props.App_Name);
    buildCloudStarterZip(props.App_Name);
    resolve();
  });
};

// Function to delpoy the cloud starter
function deploy() {
  return new Promise(async function (resolve, reject) {
    await uploadApp(props.App_Name);
    log('INFO', "DONE DEPLOYING: " + props.App_Name);
    resolve();

  });
}

// Function to publish the cloud starter
function publish() {
  return new Promise(async function (resolve, reject) {
    await publishApp(props.App_Name);
    log('INFO', 'APP PUBLISHED: ' + props.App_Name);
    log('INFO', "LOCATION: https://eu.liveapps.cloud.tibco.com/webresource/apps/" + props.App_Name + "/index.html#/starterApp/home");
    resolve();
  });
}

// Function to get the cloud library sources from GIT
getCLgit = function () {
  return getGit(props.GIT_Source_TCSTLocation, props.TCSTLocation, props.GIT_Tag_TCST);
}

// Function that injects the sources of the library into this project
function injectLibSources() {
  return new Promise(function (resolve, reject) {
    log('INFO', 'Injecting Lib Sources');
    //run('mkdir tmp');
    mkdirIfNotExist('./projects/tibco-tcstk');
    copyDir('./tmp/TCSDK-Angular/projects/tibco-tcstk', './projects/tibco-tcstk');
    //use debug versions
    var now = new Date();
    mkdirIfNotExist('./backup/');
    // Make Backups in the back up folder
    copyFile('./tsconfig.json', './backup/tsconfig-Before-Debug('+now+').json');
    copyFile('./angular.json', './backup/angular-Before-Debug('+now+').json');
    copyFile('./package.json', './backup/package-Before-Debug('+now+').json');
    copyFile('./tsconfig.debug.json', './tsconfig.json');
    copyFile('./angular.debug.json', './angular.json');
    copyFile('./package.debug.json', './package.json');
    //do NPM install
    npmInstall('./');
    npmInstall('./', 'lodash-es');
    log('INFO', 'Now you can debug the cloud library sources in your browser !!');
    resolve();
  });
}

// Function to go back to the compiled versions of the libraries
function undoLibSources() {
  return new Promise(function (resolve, reject) {
    log('INFO', 'Undo-ing Injecting Lib Sources');
    //Move back to Angular build files
    var now = new Date();
    mkdirIfNotExist('./backup/');
    // Make Backups in the back up folder
    copyFile('./tsconfig.json', './backup/tsconfig-Before-Build('+now+').json');
    copyFile('./angular.json', './backup/angular-Before-Build('+now+').json');
    copyFile('./package.json', './backup/package-Before-Build('+now+').json');
    copyFile('./tsconfig.build.json', './tsconfig.json');
    copyFile('./angular.build.json', './angular.json');
    copyFile('./package.build.json', './package.json');
    //Delete Project folder
    //FIX: Just delete those folders imported...
    deleteFolder('./projects/tibco-tcstk/tc-core-lib');
    deleteFolder('./projects/tibco-tcstk/tc-forms-lib');
    deleteFolder('./projects/tibco-tcstk/tc-liveapps-lib');
    deleteFolder('./projects/tibco-tcstk/tc-spotfire-lib');
    npmInstall('./');
    resolve();
  });
}
help = function(){
  return new Promise(async function (resolve, reject) {
    console.log('                               # |-------------------------------------------|');
    console.log('                               # |  *** T I B C O    C L O U D   C L I ***   |');
    console.log('                               # |            V1.0.2 (4-6-2019)              |');
    console.log('                               # |-------------------------------------------|');
    log('INFO', 'GULP DETAILS:');
    run('gulp --version');
    log('INFO', 'Choose a task from the following list:');
    run('gulp -T');
    resolve()
  });
}

// Start Cloudstarter Locally
start = function(){
  return new Promise(async function (resolve, reject) {
    log('INFO', 'Starting: ' + props.App_Name);
    if(props.cloudHost.includes('eu')){
      run('npm run serve_eu');
    }else{
      if(props.cloudHost.includes('au')){
        run('npm run serve_au');
      }else {
        run('npm run serve_us');
      }
    }

    resolve();
  });
}

mainT = function() {
  return new Promise(async function (resolve, reject) {
    checkPW();
    resolve();
    await promptGulp();
  });
};

test = function() {
  return new Promise(async function (resolve, reject) {
    console.log('test...');
    var now = new Date();

    resolve();
  });
};

gulp.task('test', test);

gulp.task('help', help);
help.description = 'Displays this message';
gulp.task('main', mainT);
gulp.task('default', gulp.series('help', 'main'));
gulp.task('start', start);
start.description = 'Starts the cloud starter locally';
gulp.task('obfuscate', obfuscate);
obfuscate.description = 'Obfuscates a Password';
mainT.description = 'Displays this message';
gulp.task('show-cloud', showClaims);
showClaims.description = 'Shows basic information on your cloud login. (use this to test your cloud login details)';
gulp.task('show-apps', showApps);
showAvailableApps.description = 'Shows all the applications that are deployed in the cloud and their versions.';
gulp.task('show-application-links', showLinks);
showLinks.description = 'Shows all the links to the deployed applications (that have and index.html file).';

gulp.task('build', build);
build.description = 'Build the ZIP file for your project.';
gulp.task('deploy', deploy);
deploy.description = 'Deploys your application to the cloud.';
gulp.task('publish', publish);
publish.description = 'Publishes the latest version of your application.';
gulp.task('build-deploy-publish', gulp.series('build', 'deploy', 'publish'));

gulp.task('get-cloud-libs-from-git', getCLgit);
getCLgit.description = 'Get the library sources from GIT';
gulp.task('format-project-for-lib-sources', injectLibSources);
injectLibSources.description = '(INTERNAL TASK) Used to reformat your project so you can work with the library sources (for debugging)';
gulp.task('clean', cleanTemp);
cleanTemp.description = '(INTERNAL TASK) Used to clean the temporary folders';
gulp.task('inject-lib-sources', gulp.series('clean', 'get-cloud-libs-from-git', 'format-project-for-lib-sources', 'clean'));
gulp.task('undo-lib-sources', undoLibSources);
undoLibSources.description = 'UNDO task for inject-lib-sources, use this when you want to go back to normal mode';

//Main Cloud CLI Questions
function promptGulp() {
  return new Promise(function (resolve, reject) {
    var inquirer = require('inquirer');
    inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
    inquirer.prompt([{
      type: 'autocomplete',
      name: 'command',
      suggestOnly: true,
      message: '[TIBCO CLOUD CLI] (exit to quit): ',
      source: searchAnswer,
      pageSize: 4,
      validate: function (val) {
        return val ? true : 'Type something!';
      },
    }]).then(function (answers) {
      //console.log(answers);
      console.log('Command: ' + answers.command);
      var com = answers.command;
      if (com == 'q' || com == 'quit' || com == 'exit') {
        console.log('Thank you for using the Cloud CLI... Goodbye :-) ');
        return resolve();
      } else {
        console.log('gulp ' + com);
        run('gulp ' + com);
        return promptGulp();
      }
    });
  });
}

const _ = require('lodash');
const fuzzy = require('fuzzy');
const gtasks = ['show-cloud', 'show-apps','show-application-links', 'obfuscate' ,'start','build', 'deploy', 'publish', 'clean', 'build-deploy-publish', 'get-cloud-libs-from-git', 'inject-lib-sources', 'undo-lib-sources', 'q', 'exit', 'quit', 'help'];

//User interaction
function searchAnswer(answers, input) {
  input = input || '';
  return new Promise(function (resolve) {
    setTimeout(function () {
      var fuzzyResult = fuzzy.filter(input, gtasks);
      resolve(
        fuzzyResult.map(function (el) {
          return el.original;
        })
      );
    }, _.random(30, 60));
  });
}
