from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Mock Database
projects = [
    {"id": 1, "name": "Aplikasi Kasir RS Medika", "value": 30000000},
    {"id": 2, "name": "Web Company Profile X", "value": 15000000},
    {"id": 3, "name": "Sistem HRIS Terintegrasi", "value": 80000000},
]

@app.route('/')
def dashboard():
    return render_template('dashboard.html')

@app.route('/invoices')
def invoices():
    return render_template('invoices.html', projects=projects)

@app.route('/expenses')
def expenses():
    return render_template('expenses.html', projects=projects)

@app.route('/reconciliation')
def reconciliation():
    return render_template('reconciliation.html')

# Placeholder routes (sidebar items)
@app.route('/payroll')
def payroll():
    return render_template('payroll.html')

@app.route('/vendor')
def vendor():
    return render_template('vendor.html', projects=projects)

@app.route('/freelancer')
def freelancer():
    return render_template('freelancer.html', projects=projects)

@app.route('/opex')
def opex():
    return render_template('opex.html')

@app.route('/accounts')
def accounts():
    return render_template('accounts.html')

@app.route('/internal-transfer')
def internal_transfer():
    return render_template('internal_transfer.html')

@app.route('/coa')
def coa():
    return render_template('coa.html')

@app.route('/journal')
def journal():
    return render_template('journal.html')

@app.route('/report-company')
def report_company():
    return render_template('report_company.html')

@app.route('/report-project')
def report_project():
    return render_template('report_project.html')

@app.route('/report-customer')
def report_customer():
    return render_template('report_customer.html')

if __name__ == '__main__':
    print("Membuka server di http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
