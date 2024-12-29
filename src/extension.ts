import * as vscode from 'vscode';
import { exec } from 'child_process';

const DEFAULT_GN_PATH = "gn";

// 弹出输入框让用户输入 gn 路径
async function getGnPath(): Promise<string> {
    const config = vscode.workspace.getConfiguration();
    let gnPath = await vscode.window.showInputBox({
        placeHolder: 'Enter the path to the gn executable (leave empty to use the default path)',
        prompt: 'Path to GN executable',
        value: DEFAULT_GN_PATH,
    });

    // 如果用户输入了路径，则保存到配置中
    if (gnPath) {
        config.update('gn-format.gnPath', gnPath, vscode.ConfigurationTarget.Global);
    } else {
        gnPath = DEFAULT_GN_PATH;  // 如果用户不输入，使用默认路径
    }

    return gnPath;
}

// 校验 gn 路径是否有效
async function validateGnPath(gnPath: string): Promise<boolean> {
    return new Promise((resolve) => {
        exec(`${gnPath} --version`, (error) => {
            if (error) {
                vscode.window.showErrorMessage(`Error: GN path is incorrect, please input the correct path.`);
                resolve(false);  // 路径无效
            } else {
                resolve(true);  // 路径有效
            }
        });
    });
}

export async function activate(context: vscode.ExtensionContext) {

    // 获取并校验 GN 路径
    let gnPath = await getGnPath();

    // 注册命令
    const disposable = vscode.commands.registerCommand('gn-format.formatFile', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active file to format!');
            return;
        }

        const filePath = editor.document.uri.fsPath;

        let isValid = await validateGnPath(gnPath);
        if (!isValid) {
            gnPath = await getGnPath();  // 如果路径无效，重新获取
        }

        exec(`${gnPath} format ${filePath}`, (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Error: ${stderr}`);
                return;
            }
            if (stdout) {
                vscode.window.showInformationMessage(`stdout: ${stdout}`);
            } else {
                vscode.window.showInformationMessage('GN File does not need formatting!');
            }
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
