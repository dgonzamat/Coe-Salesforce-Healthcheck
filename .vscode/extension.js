const vscode = require('vscode');
const { exec } = require('child_process');
const path = require('path');

/**
 * Activate the extension
 */
function activate(context) {
  console.log('Salesforce Monitoring System is now active!');

  // Register commands
  let analyzeCurrentFile = vscode.commands.registerCommand('salesforce.analyzeCurrentFile', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor found');
      return;
    }

    const filePath = editor.document.fileName;
    const relativePath = vscode.workspace.asRelativePath(filePath);
    
    vscode.window.showInformationMessage(`Analyzing ${relativePath}...`);
    
    exec(`npm run analyze:file "${filePath}"`, { cwd: vscode.workspace.rootPath }, (error, stdout, stderr) => {
      if (error) {
        vscode.window.showErrorMessage(`Analysis failed: ${error.message}`);
        return;
      }
      
      vscode.window.showInformationMessage('Analysis completed successfully');
      console.log(stdout);
    });
  });

  let runFullAnalysis = vscode.commands.registerCommand('salesforce.runFullAnalysis', () => {
    vscode.window.showInformationMessage('Running full analysis...');
    
    exec('npm run analyze', { cwd: vscode.workspace.rootPath }, (error, stdout, stderr) => {
      if (error) {
        vscode.window.showErrorMessage(`Analysis failed: ${error.message}`);
        return;
      }
      
      vscode.window.showInformationMessage('Full analysis completed successfully');
      console.log(stdout);
    });
  });

  let generateReport = vscode.commands.registerCommand('salesforce.generateReport', () => {
    vscode.window.showInformationMessage('Generating report...');
    
    exec('npm run report', { cwd: vscode.workspace.rootPath }, (error, stdout, stderr) => {
      if (error) {
        vscode.window.showErrorMessage(`Report generation failed: ${error.message}`);
        return;
      }
      
      vscode.window.showInformationMessage('Report generated successfully');
      console.log(stdout);
    });
  });

  let analyzeGovernorLimits = vscode.commands.registerCommand('salesforce.analyzeGovernorLimits', () => {
    vscode.window.showInformationMessage('Analyzing governor limits...');
    
    exec('npm run analyze:limits', { cwd: vscode.workspace.rootPath }, (error, stdout, stderr) => {
      if (error) {
        vscode.window.showErrorMessage(`Governor limits analysis failed: ${error.message}`);
        return;
      }
      
      vscode.window.showInformationMessage('Governor limits analysis completed');
      console.log(stdout);
    });
  });

  let analyzePerformance = vscode.commands.registerCommand('salesforce.analyzePerformance', () => {
    vscode.window.showInformationMessage('Analyzing performance...');
    
    exec('npm run analyze:performance', { cwd: vscode.workspace.rootPath }, (error, stdout, stderr) => {
      if (error) {
        vscode.window.showErrorMessage(`Performance analysis failed: ${error.message}`);
        return;
      }
      
      vscode.window.showInformationMessage('Performance analysis completed');
      console.log(stdout);
    });
  });

  let analyzeCodeQuality = vscode.commands.registerCommand('salesforce.analyzeCodeQuality', () => {
    vscode.window.showInformationMessage('Analyzing code quality...');
    
    exec('npm run analyze:quality', { cwd: vscode.workspace.rootPath }, (error, stdout, stderr) => {
      if (error) {
        vscode.window.showErrorMessage(`Code quality analysis failed: ${error.message}`);
        return;
      }
      
      vscode.window.showInformationMessage('Code quality analysis completed');
      console.log(stdout);
    });
  });

  let showDashboard = vscode.commands.registerCommand('salesforce.showDashboard', () => {
    vscode.window.showInformationMessage('Opening dashboard...');
    
    // Create and show webview panel
    const panel = vscode.window.createWebviewPanel(
      'salesforceDashboard',
      'Salesforce Monitoring Dashboard',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    // Set the webview content
    panel.webview.html = getDashboardHtml();
  });

  let fixAllIssues = vscode.commands.registerCommand('salesforce.fixAllIssues', () => {
    vscode.window.showInformationMessage('Attempting to fix issues...');
    
    // This would integrate with the analysis tools to provide auto-fixes
    vscode.window.showInformationMessage('Auto-fix functionality coming soon!');
  });

  // Add commands to subscriptions
  context.subscriptions.push(
    analyzeCurrentFile,
    runFullAnalysis,
    generateReport,
    analyzeGovernorLimits,
    analyzePerformance,
    analyzeCodeQuality,
    showDashboard,
    fixAllIssues
  );
}

/**
 * Generate dashboard HTML
 */
function getDashboardHtml() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Salesforce Monitoring Dashboard</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: var(--vscode-editor-background);
                color: var(--vscode-editor-foreground);
            }
            .dashboard {
                max-width: 1200px;
                margin: 0 auto;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .metric-card {
                background-color: var(--vscode-panel-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 8px;
                padding: 20px;
                text-align: center;
            }
            .metric-value {
                font-size: 2em;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .metric-label {
                color: var(--vscode-descriptionForeground);
                font-size: 0.9em;
            }
            .actions {
                display: flex;
                gap: 10px;
                justify-content: center;
                flex-wrap: wrap;
            }
            .action-btn {
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }
            .action-btn:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
        </style>
    </head>
    <body>
        <div class="dashboard">
            <div class="header">
                <h1>🚀 Salesforce Monitoring Dashboard</h1>
                <p>Comprehensive analysis and monitoring for your Salesforce code</p>
            </div>
            
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value" id="governor-limits">-</div>
                    <div class="metric-label">Governor Limit Issues</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" id="performance">-</div>
                    <div class="metric-label">Performance Issues</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" id="quality">-</div>
                    <div class="metric-label">Code Quality Issues</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" id="overall">-</div>
                    <div class="metric-label">Overall Score</div>
                </div>
            </div>
            
            <div class="actions">
                <button class="action-btn" onclick="runAnalysis()">Run Full Analysis</button>
                <button class="action-btn" onclick="generateReport()">Generate Report</button>
                <button class="action-btn" onclick="analyzeLimits()">Analyze Limits</button>
                <button class="action-btn" onclick="analyzePerformance()">Analyze Performance</button>
                <button class="action-btn" onclick="analyzeQuality()">Analyze Quality</button>
            </div>
        </div>
        
        <script>
            // Dashboard functionality
            function runAnalysis() {
                // This would trigger the analysis command
                console.log('Running full analysis...');
            }
            
            function generateReport() {
                console.log('Generating report...');
            }
            
            function analyzeLimits() {
                console.log('Analyzing governor limits...');
            }
            
            function analyzePerformance() {
                console.log('Analyzing performance...');
            }
            
            function analyzeQuality() {
                console.log('Analyzing code quality...');
            }
            
            // Load initial data
            document.addEventListener('DOMContentLoaded', function() {
                // This would load actual metrics from the analysis tools
                document.getElementById('governor-limits').textContent = '5';
                document.getElementById('performance').textContent = '12';
                document.getElementById('quality').textContent = '8';
                document.getElementById('overall').textContent = '85%';
            });
        </script>
    </body>
    </html>
  `;
}

/**
 * Deactivate the extension
 */
function deactivate() {
  console.log('Salesforce Monitoring System is now deactivated');
}

module.exports = {
  activate,
  deactivate
}; 