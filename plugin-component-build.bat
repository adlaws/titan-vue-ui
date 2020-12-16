@echo off
REM ============================================================================
REM Confirm user has specified a database
REM ============================================================================
IF [%1] EQU [] GOTO USAGE

set COMPONENT_NAME=%1
npx vue-cli-service build --target lib --formats umd-min --no-clean --dest public\plugins\components\%COMPONENT_NAME% --name "%COMPONENT_NAME%" public\plugins\components\%COMPONENT_NAME%\%COMPONENT_NAME%.vue
GOTO END

REM ============================================================================
REM Show command usage instructions
REM ============================================================================
:USAGE
    ECHO Component name not specified. Exiting.
    ECHO Usage  : %0% COMPONENT_NAME

REM ============================================================================
REM Finish
REM ============================================================================
:END
	ECHO Done.