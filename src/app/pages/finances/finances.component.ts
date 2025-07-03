import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-finances',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective
  ],
  templateUrl: './finances.component.html',
  styleUrls: ['./finances.component.scss']
})
export class FinancesComponent implements OnInit {

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `R$ ${typeof value === 'number' ? value.toLocaleString('pt-BR') : value}`
        }
      }
    }
  };
  public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    }
  };
  public barChartType: ChartType = 'bar';
  public doughnutChartType: ChartType = 'doughnut';

  public profitChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Lucro Mensal (R$)', backgroundColor: 'rgba(75, 192, 192, 0.6)' }]
  };

  public expenseChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Gasto Fixo Mensal (Salários) (R$)', backgroundColor: 'rgba(255, 99, 132, 0.6)' }]
  };

  public paymentMethodChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)'
      ],
    }]
  };


  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadFinancialData();
  }

  urlAPISales: string = 'http://localhost:8080/api/sales/';

  loadFinancialData(): void {
    this.http.get<any>(`${this.urlAPISales}` + "overview", { withCredentials: true }).subscribe({
      next: (data) => {
        this.processChartData(data.sales, data.employees);
      },
      error: (err) => {
        if (err.status !== 401) {
          this.snackBar.open('Erro ao carregar dados financeiros', 'Fechar', { duration: 3000, panelClass: ['error-snackbar'] });
        }
      }
    });
  }

  processChartData(sales: any[], employees: any[]): void {
    const monthlyProfit: { [key: string]: number } = {};
    sales.forEach(sale => {
      // @ts-ignore
      const saleDate = new Date(sale.date);
      const monthYear = `${saleDate.getFullYear()}-${(saleDate.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!monthlyProfit[monthYear]) { monthlyProfit[monthYear] = 0; }
      monthlyProfit[monthYear] += sale.total;
    });

    const sortedMonths = Object.keys(monthlyProfit).sort();
    const profitLabels = sortedMonths.map(month => this.formatMonthLabel(month));
    const profitDataPoints = sortedMonths.map(month => monthlyProfit[month]);

    this.profitChartData = { ...this.profitChartData, labels: profitLabels, datasets: [{ ...this.profitChartData.datasets[0], data: profitDataPoints }] };

    const totalMonthlySalary = employees.reduce((sum, employee) => sum + (employee.salary || 0), 0);
    const expenseDataPoints = profitLabels.map(() => totalMonthlySalary);

    this.expenseChartData = { ...this.expenseChartData, labels: profitLabels, datasets: [{ ...this.expenseChartData.datasets[0], data: expenseDataPoints }] };


    const paymentMethodTotals: { [key: string]: number } = {};
    sales.forEach(sale => {
      const method = sale.paymentMethod || 'Não definido';
      if (!paymentMethodTotals[method]) {
        paymentMethodTotals[method] = 0;
      }
      paymentMethodTotals[method] += sale.total;
    });

    const paymentLabels = Object.keys(paymentMethodTotals);
    const paymentData = Object.values(paymentMethodTotals);

    this.paymentMethodChartData = {
      ...this.paymentMethodChartData,
      labels: paymentLabels,
      datasets: [{ ...this.paymentMethodChartData.datasets[0], data: paymentData }]
    };
  }

  formatMonthLabel(monthYear: string): string {
    const [year, month] = monthYear.split('-');
    // @ts-ignore
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  }
}
