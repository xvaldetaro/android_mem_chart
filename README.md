# Android Memory Chart
A tiny tool with a web server and client that shows a line (updates every second) graph of the Android memory usage, broken down by type.

The tool is just a simple loop calling `adb shell dumpsys meminfo`, parsing the desired results, and pushing it to the live client via Websockets

## Instalation
##### NPM/Yarn
`npm install -g android_mem_chart`
or
`yarn global add android_mem_chart`

##### By cloning
```
git clone https://github.com/xvaldetaro/android_mem_chart
cd android_mem_chart
npm install
./bin/androidmc <process.name>
```

## Usage
Find the process name. You can call `adb shell dumpsys meminfo` and see all processes there in order to pick which one.
then:

`androidmc serve -l <process.name>`

The `-l` option will launch the browser automatically pointing to `localhost:3000`

If the browser is already open, just use:

`androidmc serve <process.name>`

## Screenshot
![](https://github.com/xvaldetaro/android_mem_chart/blob/screenshots/screenshots/amc_animate.gif?raw=true)
