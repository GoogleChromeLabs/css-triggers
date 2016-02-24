# Suite

This is a collection of files we use to run the tests. If you want to run your own tests you need to:

1. Clone this repo.
1. Come to this folder (_suite/).
1. Run `node generate.js`.
1. Open the newly created html/ folder.
1. Open a file of interest.
1. Run `gogo()` from the console. (`gogo()` will start the profiling, mutate the CSS property, and then stop the profile. You can also manually start profiling and instead call `go()`. Your call.)

If you are testing Blink via WebDriver you can also do that automatically via execute.js:

```bash
node execute.js blink
```

Unfortunately WebDriver doesn't seem to be able to pull performance logs from Firefox, Safari or Edge, so those tests are all manual at the moment.
