// gulp dependencies
const gulp = require("gulp");
const { task, dest, watch, parallel, series } = gulp;
const replace = require("gulp-replace");
const uglify = require("gulp-uglify-es").default;
const htmlclean = require("gulp-htmlclean");
const cleanCSS = require("gulp-clean-css");

//env dependencies
const dotenv = require("dotenv");

dotenv.config();

/**
 * configuration object
 */
const config = {
  dictionaryAPIKey: process.env.DICT_API,
  // path config
  paths: {
    src: ["src/**/*"],
    srcHTML: "src/views/*.html",
    srcCSS: "src/styles/*.css",
    srcJS: "src/scripts/*.js",
    backgroundScript: "src/scripts/background.js",

    tmp: "tmp/",
    tmpJS: "tmp/scripts/",

    dist: "dist/",
    distHTML: "dist/views/",
    distCSS: "dist/styles/",
    distJS: "dist/scripts/",
  },
};

//
// DEVELOPMENT
//

task("replace", () => {
  return (
    gulp
      .src(config.paths.backgroundScript)
      // replace the occurence of this string with api key
      .pipe(replace("<<!--dict-api-key-->>", config.dictionaryAPIKey))
      .pipe(dest(config.paths.tmpJS))
  );
});

task("copy", () => {
  return (
    gulp
      // we exclude the content script from the copied files
      .src([...config.paths.src, `!${config.paths.backgroundScript}`])
      .pipe(dest(config.paths.tmp))
  );
});

task("dev", parallel("replace", "copy"));

task(
  "watch",
  series("dev", () => {
    watch(config.paths.src[0], series("dev"));
  }),
);

task("default", series("watch"));

//
// PRODUCTION
//
task("html:dist", () => {
  return gulp
    .src(config.paths.srcHTML)
    .pipe(htmlclean())
    .pipe(dest(config.paths.distHTML));
});

task("css:dist", () => {
  return gulp
    .src(config.paths.srcCSS)
    .pipe(cleanCSS())
    .pipe(dest(config.paths.distCSS));
});

task("rename:dist", () => {
  return gulp
    .src(config.paths.backgroundScript)
    .pipe(replace("<<!--dict-api-key-->>", config.dictionaryAPIKey))
    .pipe(uglify())
    .pipe(dest(config.paths.distJS));
});

task("js:dist", () => {
  return gulp
    .src([config.paths.srcJS, `!${config.paths.backgroundScript}`])
    .pipe(uglify())
    .pipe(dest(config.paths.distJS));
});

task("copy:dist", () => {
  return gulp
    .src([
      ...config.paths.src,
      `!${config.paths.srcHTML}`,
      `!${config.paths.srcJS}`,
      `!${config.paths.srcCSS}`,
    ])
    .pipe(dest(config.paths.dist));
});

task(
  "build",
  parallel("html:dist", "css:dist", "rename:dist", "js:dist", "copy:dist"),
);
