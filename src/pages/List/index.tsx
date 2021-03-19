import React, { useMemo, useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { Container, Content, Filters } from './styles'
import ContentHeader from '../../components/ContentHeader'
import SelectInput from '../../components/SelectInput'
import HistoryFinanceCard from '../../components/HistoryFinanceCard'

import gains from '../../repositories/gains'
import expenses from '../../repositories/expenses'
import formatCurrency from '../../utils/formatCurrency'
import formatDate from '../../utils/formatDate'
import listOfMonths from '../../utils/months'

interface IRouteParams {
    match: {
        params: {
            type: string
        }
    }
}

interface IData {
    id: string
    description: string
    amountFormatted: string
    frequency: string
    dateFomatted: string
    tagColor: string
}
const List: React.FC<IRouteParams> = ({ match }) => {
    const [data, setData] = useState<IData[]>([])
    const [monthSelected, setMonthSelected] = useState<number>(new Date().getMonth() + 1)
    const [yearSelected, setYearSelected] = useState<number>(new Date().getFullYear())
    const [frequencyFilterSelected, setFrequencyFilterSelected] = useState(['recorrente', 'eventual'])

    const movimentType = match.params.type

    const pageData = useMemo(() => {
       return movimentType === 'entry-balance' ?
            {
                title: 'Entradas',
                lineColor: '#4e41f0',
                data: gains
            }
            :
            {
                title: 'Saídas',
                lineColor: '#E44C4E',
                data: expenses
            }

    }, [movimentType])

    const years = useMemo(() => {
        let uniqueYears: number[] = []

        const { data } = pageData

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
    }, [pageData])

    const months = useMemo(() => {
        return listOfMonths.map((month, index) => {
            return {
                value: index + 1,
                label: month,
            }

        })

    }, [])

    const handleFrequencyClick = (frequency: string) => {
        const alreadySelected = frequencyFilterSelected.findIndex(item => item === frequency)
        if (alreadySelected >= 0) {
            const filtered = frequencyFilterSelected.filter(item => item !== frequency)
            setFrequencyFilterSelected(filtered)
        } else {

            setFrequencyFilterSelected((prev) => [...prev, frequency])
        }
    }

    const handleMonthSelected = (month: string) =>{
        try{
            const parseMonth = Number(month)
            setMonthSelected(parseMonth)
        }catch(error){
            throw new Error('Invalid month value. Is accept 0 - 24.')
        }
    }
    const handleYearhSelected = (year: string) =>{
        try{
            const parseYear = Number(year)
            setYearSelected(parseYear)
        }catch(error){
            throw new Error('Invalid year value. Is integer numbers.')
        }
    }


    useEffect(() => {

        const  { data } = pageData

        const filteredData = data.filter(item => {
            const date = new Date(item.date)
            const month = date.getMonth() + 1
            const year = date.getFullYear()
            console.log(month, monthSelected, year, yearSelected)
            return month === monthSelected && year === yearSelected && frequencyFilterSelected.includes(item.frequency)
        })
        console.log(filteredData)

        const formattedData = filteredData.map(item => {
            return {
                id: uuidv4(),
                description: item.description,
                amountFormatted: formatCurrency(Number(item.amount)),
                frequency: item.frequency,
                dateFomatted: formatDate(item.date),
                tagColor: item.frequency === 'recorrente' ? '#4e41f0' : '#e44c4e'
            }
        })
        setData(formattedData)
    }, [pageData, monthSelected, yearSelected, frequencyFilterSelected])
    return (
        <Container>
            <ContentHeader title={pageData.title} lineColor={pageData.lineColor}>
                <SelectInput options={months} onChange={(e) => handleMonthSelected(e.target.value)} defaultValue={monthSelected} />
                <SelectInput options={years} onChange={(e) => handleYearhSelected(e.target.value)} defaultValue={yearSelected} />
            </ContentHeader>
            <Filters>
                <button
                    type="button"
                    className={`tag-filter tag-filter-recurrent
                    ${frequencyFilterSelected.includes('recorrente') && 'tag-actived'}`}
                    onClick={() => handleFrequencyClick('recorrente')}
                >
                    Recorrentes
                </button>
                <button
                    type="button"
                    className={`tag-filter tag-filter-eventual 
                    ${frequencyFilterSelected.includes('eventual') && 'tag-actived'}`}
                    onClick={() => handleFrequencyClick('eventual')}
                >
                    Eventuais
                </button>
            </Filters>
            <Content>
                {
                    data.map(item => (


                        <HistoryFinanceCard
                            key={item.id}
                            tagColor={item.tagColor}
                            title={item.description}
                            subtitle={item.dateFomatted}
                            amount={item.amountFormatted}
                        />
                    ))
                }
            </Content>
        </Container>
    )
}

export default List