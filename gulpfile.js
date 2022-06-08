//GULP 4.x.x
//LABS Project - Docs Builder 

// Config and Setup Section
var projectName="Project Air";
var projectSource=""; // current Folder
var projectTarget="";
// Subfolder adjustment - default: 2 back
var sfa = "" //labs docs 1 more

// Includes
const { src, dest, watch, series } = require('gulp');

//other used Plugins
var run = require('child_process').exec;
var del = require('del');

// *** just runs Main CLI Commands ***
// ***********************************
var infostr="";

function header(cb) {
  console.log('');
  console.log('*****************************************');
  console.log('*');
  console.log('* Project Name   : '+projectName+' Docs');
  console.log('* Project Target : '+projectTarget);
  if (infostr!="") {
    console.log('*');
    console.log(infostr);
  };
  console.log('*');
  console.log('*****************************************');
  console.log('');
  cb();
}

function info(cb) {
  infostr ='* please use one of these commands: \n';
  infostr+='*  - gulp build';
  cb();
}

function runaction(cb) {
  infostr ='* Repo Docs Builder \n';
  infostr+='* running action ...';
  cb();
}

function runHugo(cb) {
  console.log('running hugo');
    run('set HUGO_ENV=production&&hugo -D -s '+projectSource+'docs-src', function (err, stdout, stderr) {
        // console.log(stdout); // See Hugo output
        // console.log(stderr); // Debugging feedback
        cb(err);
    });
}

function runCopy() {
  console.log('*** COPY ...');	
  // copy Docs
  return src(''+projectSource+'docs/**').pipe(dest(sfa +'../../'+projectTarget+'/docs'));
}

function cleanTarget() {
  // clean Docs
  return del([sfa +''+projectTarget+'/docs/**/*'], {force: true});
};

// *** Gulp series and exports     ***
// ***********************************

var sbuild = series(runaction, header, cleanTarget, runHugo);

// run build
exports.build = sbuild;

// Default
exports.default = series(info, header);

