@ECHO off

REM The %~dsp0 used below is a special environmental
REM variable which contains the absolute path of the
REM currently executing batch file (i.e. the file
REM you are looking at right now) using short file
REM names to avoid spaces in the path.
REM See: https://www.microsoft.com/resources/documentation/windows/xp/all/proddocs/en-us/percent.mspx?mfr=true
SET CURRENT=%~dsp0
SET PLUGIN_COMPONENT_SUBDIR=public\plugins\components
SET PLUGIN_COMPONENT_DIR=%CURRENT%%PLUGIN_COMPONENT_SUBDIR%

REM ============================================================================
REM Confirm user has specified a component
REM ============================================================================
IF [%1] EQU [] GOTO USAGE
IF [%1] EQU [all] GOTO BUILD_ALL

REM ============================================================================
REM Build single component
REM ============================================================================
set COMPONENT_NAME=%1
ECHO Building %COMPONENT_NAME% in %PLUGIN_COMPONENT_SUBDIR%\%COMPONENT_NAME%\%COMPONENT_NAME%.vue
npx vue-cli-service build --target lib --formats umd-min --no-clean --dest %PLUGIN_COMPONENT_DIR%\%COMPONENT_NAME% --name "%COMPONENT_NAME%" %PLUGIN_COMPONENT_DIR%\%COMPONENT_NAME%\%COMPONENT_NAME%.vue
GOTO END

REM ============================================================================
REM Build all components under PLUGIN_COMPONENT_DIR
REM ============================================================================
:BUILD_ALL
ECHO Build all components in %PLUGIN_COMPONENT_DIR%
FOR /F %%D IN ('dir /a:d /b /o:n %PLUGIN_COMPONENT_DIR%') DO (
    ECHO Building %PLUGIN_COMPONENT_SUBDIR%\%%D\%%D.vue
    npx vue-cli-service build --target lib --formats umd-min --no-clean --dest %PLUGIN_COMPONENT_DIR%\%%D --name "%%D" %PLUGIN_COMPONENT_DIR%\%%D\%%D.vue
)
GOTO END

REM ============================================================================
REM Show command usage instructions
REM ============================================================================
:USAGE
    ECHO "Component name not specified. Exiting."
    ECHO "Usage:"
    ECHO "    Build a single component : %0% COMPONENT_NAME"
    ECHO "    Build *all* components   : %0% all"

REM ============================================================================
REM Finish
REM ============================================================================
:END
