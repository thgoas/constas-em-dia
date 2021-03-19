import React, { useState, useMemo, useCallback}from 'react'


import ContentHeader from '../../components/ContentHeader'
import SelectInput from '../../components/SelectInput'
import WalletBox from '../../components/WalletBox'
import MessageBox from '../../components/MessageBox'
import PieChartBox from '../../components/PieChartBox'
import HistoryBox from '../../components/HistoryBox'
import BarChartBox from '../../components/BarChartBox'

import happyImg from '../../assets/happy.svg'
import sadImg from '../../assets/sad.svg'
import grinningImg from '../../assets/grinning.svg'

import expenses from '../../repositories/expenses'
import gains from '../../repositories/gains'
import listOfMonths from '../../utils/months'




import { Container, Content } from './styles'
import { UserName } from '../../components/MainHeader/styles'

const Dashboard: React.FC = () => {
    const [monthSelected, setMonthSelected] = useState<number>(new Date().getMonth() + 1)
    const [yearSelected, setYearSelected] = useState<number>(new Date().getFullYear())

    // const options = [
    //     { value: 'Thiago', label: 'Thiago' },
    //     { value: 'Maria', label: 'Maria' },
    //     { value: 'Marcos', label: 'Marcos' },
    // ]

    const years = useMemo(() => {
        let uniqueYears: number[] = []
        const data = [...expenses, ...gains]
        

        data.forEach(item => {
            const date = new Date(item.date)
            const year = date.getFullYear()

            if (!uniqueYears.includes(year)) {
                uniqueYears.push(year)
            }
        })

        return uniqueYears.map(year => {
            return {
                value: year,
                label: year
            }
        })
    }, [])

    const months = useMemo(() => {
        return listOfMonths.map((month, index) => {
            return {
                value: index + 1,
                label: month,
            }

        })

    }, [])

    const totalExpenses = useMemo(() => {
        let total: number = 0

        expenses.forEach(item => {
            const date = new Date(item.date)
            const year = date.getFullYear()
            const month = date.getMonth() + 1

            if(month === monthSelected && year === yearSelected){
                try {
                    total += Number(item.amount)
                } catch (error) {
                    throw new Error('Invalid amount! Amount must be number.')
                }
            }
        })

        return total
    },[monthSelected, yearSelected])
    
    
    const totalGains = useMemo(() => {
        let total: number = 0

        gains.forEach(item => {
            const date = new Date(item.date)
            const year = date.getFullYear()
            const month = date.getMonth() + 1

            if(month === monthSelected && year === yearSelected){
                try {
                    total += Number(item.amount)
                } catch (error) {
                    throw new Error('Invalid amount! Amount must be number.')
                }
            }
        })

        return total
    },[monthSelected, yearSelected])

    const totalBalance = useMemo(()=>{
        return totalGains - totalExpenses
    },[totalExpenses, totalGains])

    const message = useMemo(() => {
        if(totalBalance < 0) {
            return {
                title: 'Que triste!',
                description: 'Neste mês, você gastou mais do que deveria.',
                footerText: 'verifique seus gastos e tente cortar algumas coisas desnecessárias.',
                icon: sadImg
            }
        }else if (totalGains === 0 && totalExpenses ===0){
            return {
                title:"Op's!",
                description:"Neste mês, não há registros de entradas ou saídas.",
                footerText:"Parece que você não fez nenhum registro no mês e ano selecionado.",
                icon:happyImg
            }
        } else if(totalBalance === 0){
            return {
                title: 'Ufaa!',
                description: 'Neste mês, você gastou exatamente o que ganhou.',
                footerText: 'Tenha cuidado. No próximo mês tente poupar o seu dinheiro.',
                icon: grinningImg
            } 
        } else {
            return {
                title:"Muito bem!",
                description:"Sua carteira está positiva!",
                footerText:"Continue assim. Considere investir o seu saldo.",
                icon:happyImg
            }
        }
    },[totalBalance, totalGains, totalExpenses])

    const historyData = useMemo(() => {
        return listOfMonths.map((_, month) => {
            let amountEntry = 0
            gains.forEach(gain => {
                const date = new Date(gain.date)
                const gainMonth = date.getMonth()
                const gainYear = date.getFullYear()

                if(gainMonth === month && gainYear === yearSelected){
                    try {
                        amountEntry += Number(gain.amount)
                        
                    } catch (error) {
                        throw new Error('amountEntry is invalid. amountEntry must be valid number.')
                    }
                }  
            })

            let amountOutput = 0
            expenses.forEach(expense => {
                const date = new Date(expense.date)
                const expenseMonth = date.getMonth()
                const expenseYear = date.getFullYear()

                if(expenseMonth === month && expenseYear === yearSelected){
                    try {
                        amountOutput += Number(expense.amount)
                        
                    } catch (error) {
                        throw new Error('amountOutput is invalid. amountOutput must be valid number.')
                    }
                }  
            })

            return {
                monthNumber: month,
                month: listOfMonths[month].substr(0,3),
                amountEntry,
                amountOutput
            }

        })
        .filter(item => {
            const currentMonth = new Date().getMonth()
            const currentYear = new Date().getFullYear()

            return ( yearSelected === currentYear && item.monthNumber <= currentMonth) || (yearSelected < currentYear)

        })
    },[yearSelected])

    const relationExpensesVersusGains = useMemo(() => {
        const total = totalGains + totalExpenses
        const percentGains = Number(((totalGains / total) * 100).toFixed(1))
        const percentExpenses = Number(((totalExpenses / total) * 100).toFixed(1))

        const data =[
            {
                name: 'Entradas',
                value: totalGains,
                percent:percentGains ? percentGains : 0,
                color: '#e44c4e'
            },
            {
                name: 'Saídas',
                value: totalExpenses,
                percent: percentExpenses ? percentExpenses : 0,
                color: '#f7931b'
            },

        ]

        return data
    },[totalGains, totalExpenses ])

    const relationExpenseRecurrentVersusEventual = useMemo(()=>{
        let amountRecurrent = 0
        let amountEventual = 0

        expenses
        .filter((expense) => {
            const date = new Date(expense.date)
            const year =  date.getFullYear()
            const month = date.getMonth() + 1

            return month === monthSelected && year === yearSelected
        })
        .forEach((expense)=> {
            if(expense.frequency === 'recorrente'){
                return amountRecurrent += Number(expense.amount)
            }
            if(expense.frequency === 'eventual'){
                return amountEventual += Number(expense.amount)
            }
        })

        const total = amountRecurrent + amountEventual

        const percentRecurrent = Number(((amountRecurrent / total) * 100).toFixed(1))
        const percentEventual = Number(((amountEventual / total) * 100).toFixed(1))
    
        return [
            {
                name:  'Recorrentes',
                amount: amountRecurrent,
                percent: percentRecurrent ? percentRecurrent : 0,
                color: '#f7931b'
            },
            {
                name:  'Envetual',
                amount: amountEventual,
                percent: percentEventual ? percentEventual : 0,
                color: '#E44c4e'
            }
        ]
    },[monthSelected, yearSelected])

    const relationGainsRecurrentVersusEventual = useMemo(()=>{
        let amountRecurrent = 0
        let amountEventual = 0

        gains
        .filter((gain) => {
            const date = new Date(gain.date)
            const year =  date.getFullYear()
            const month = date.getMonth() + 1

            return month === monthSelected && year === yearSelected
        })
        .forEach((gain)=> {
            if(gain.frequency === 'recorrente'){
                return amountRecurrent += Number(gain.amount)
            }
            if(gain.frequency === 'eventual'){
                return amountEventual += Number(gain.amount)
            }
        })

        const total = amountRecurrent + amountEventual

        const percentRecurrent = Number(((amountRecurrent / total) * 100).toFixed(1))
        const percentEventual = Number(((amountEventual / total) * 100).toFixed(1))
    
        return [
            {
                name:  'Recorrentes',
                amount: amountRecurrent,
                percent: percentRecurrent ? percentRecurrent : 0 ,
                color: '#f7931b'
            },
            {
                name:  'Envetual',
                amount: amountEventual,
                percent: percentEventual ? percentRecurrent : 0,
                color: '#E44c4e'
            }
        ]
    },[monthSelected, yearSelected])

    const handleMonthSelected = useCallback((month: string) =>{
        try{
            const parseMonth = Number(month)
            setMonthSelected(parseMonth)
        }catch(error){
            throw new Error('Invalid month value. Is accept 0 - 24.')
        }
    },[])
    const handleYearhSelected = useCallback((year: string) =>{
        try{
            const parseYear = Number(year)
            setYearSelected(parseYear)
        }catch(error){
            throw new Error('Invalid year value. Is integer numbers.')
        }
    },[])

    return (
        <Container>
            <ContentHeader title="Dashboard" lineColor="#f7931B">
                <SelectInput
                    options={months}
                    onChange={(e) => handleMonthSelected(e.target.value)}
                    defaultValue={monthSelected} />
                <SelectInput
                    options={years}
                    onChange={(e) => handleYearhSelected(e.target.value)}
                    defaultValue={yearSelected} />
            </ContentHeader>

            <Content>
                <WalletBox
                    title="saldo"
                    color="#4e41f0"
                    amount={totalBalance}
                    footerlabel="atualizado com base nas entradas e saidas"
                    icon="dolar"
                />
                <WalletBox
                    title="entradas"
                    color="#f7931b"
                    amount={totalGains}
                    footerlabel="atualizado com base nas entradas e saidas"
                    icon="arrowUp"
                />
                <WalletBox
                    title="saidas"
                    color="#e44c4e"
                    amount={totalExpenses}
                    footerlabel="atualizado com base nas entradas e saidas"
                    icon="arrowDown"
                />
                <MessageBox 
                    title={message.title}
                    description={message.description}
                    footerText={message.footerText}
                    icon={message.icon}
                />

                <PieChartBox data={relationExpensesVersusGains}/>
                <HistoryBox
                    data={historyData}
                    lineColorAmountEntry="#f7931b"
                    lineColorAmountOutput="#e44c4e"
                />

                <BarChartBox 
                data={relationExpenseRecurrentVersusEventual}
                title="Saídas"
                />
                <BarChartBox 
                data={relationGainsRecurrentVersusEventual}
                title="Entradas"
                />
            </Content>
        </Container>
    )
}

export default Dashboard