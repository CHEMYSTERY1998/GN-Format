import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "gn-format" is now active!');

	const disposable = vscode.commands.registerCommand('gn-format.formatFile', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active file to format!');
            return;
        }

        const filePath = editor.document.uri.fsPath;

        exec(`gn format ${filePath}`, (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Error: ${stderr}`);
                return;
            }
			if (stdout) {
				vscode.window.showInformationMessage(`stdout: ${stdout}`);
			} else {
				vscode.window.showInformationMessage('GN File not need formatted!');
			}
        });
    });
	
	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
