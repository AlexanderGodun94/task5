import React from 'react';
import {Button, Row, Space, Table} from 'antd';
import {displayDate, getErrorText} from '../../../../shared/lib';
import { GetRequestsApiParams, IRequest, REQUEST_STATUS_COLOR, REQUEST_STATUS_TITLE, RequestStatuses } from '../..';
import { Container, Typography } from '../../../../shared/ui';
import { useEffect, useState } from 'react';
import {investorApi} from "../../../../widgets/request/api";
import { message } from '../../../../shared/ui';
import {useAppProcessStore} from "../../../appProcess";
import { Toolbar, IconButton, Grid} from '@material-ui/core';
import { Delete, Block, CheckCircle } from '@material-ui/icons';
import ReactCountryFlag from "react-country-flag";
import InfiniteScroll from 'react-infinite-scroll-component';
import SliderInput from "./SliderInput";
import InputField from "./InputField";
const seedrandom = require('seedrandom');
const seedForDelete = 5574;
const seedForSwap = 6600;
const seedForInsert = 9600;

const translations = [
    {
        code: "uk",
        setSeed: "Встановити насіння",
        users: "Користувачі",
        amountOfMistakes: "Кількість помилок",
        randomSeed: "Випадкове насіння",
        phone:"Телефон",
        address:"Адреса",
        fullName:"Повне ім'я",
        alphabet: 'абвгґдеєжзиіїйклмнопрстуфхцчшщьюя',
    },
    {
        code: "en_US",
        setSeed: "Set seed",
        users: "Users",
        amountOfMistakes: "Amount of mistakes",
        randomSeed: "Random seed",
        phone:"Phone",
        address:"Address",
        fullName:"Full name",
        alphabet: 'abcdefghijklmnopqrstuvwxyz',
    },
    {
        code: "pl",
        setSeed: "Ustaw ziarno",
        users: "Użytkownicy",
        amountOfMistakes: "Ilość błędów",
        randomSeed: "Losowe ziarno",
        phone:"Telefon",
        address:"Adres",
        fullName:"Pełne imię i nazwisko",
        alphabet: 'aąbcćdeęfghijklłmnńoóprsśtuwyzźż',
    }
];


interface PropTypes<T> {
  data: IRequest[] | undefined,
  loading: boolean,
  title?: string,
  disableFilters?: boolean,
  setFilters?: (data: GetRequestsApiParams) => void,
  clearFilters?: () => void
}

interface InputFieldProps {
    value: string;
    onChange: (value: string) => void;
}

export function RequestsTable<T>({ data, loading, disableFilters = false, title = 'Users', setFilters, clearFilters }: PropTypes<T>) {


    const [messageApi, messageContext] = message.useMessage();
    const [country, setCountry] = useState('');

    const [seed, setSeed] = useState(0);
    const [tableData, setTableData] = useState<any[]>([]);
    const [tableDataWithError, setTableDataWithError] = useState<any[]>([]);

    const [countError, setCountError] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false); // флаг загрузки новых данных
    const [currentPage, setCurrentPage] = useState(1); // текущая страница

    const [sliderValue, setSliderValue] = useState<number>(0);
    const [inputValue, setInputValue] = useState<string>("");

    const [language, setLanguage] = useState(translations[0].code);

    const getTranslation = (code: string, key: keyof typeof translations[0]) => {
        const translation = translations.find(t => t.code === code);
        if (!translation) throw new Error(`Translation not found for code ${code}`);
        return translation[key];
    };

    const deleteElement = (obj: any, numberStr: number, numberError: number) => {
        let fieldsCount = Object.keys(obj).length;
        let randomIndex = Math.floor(seedrandom(seedForDelete + numberStr + numberError)() * fieldsCount);
        let randomField = Object.keys(obj)[randomIndex];
        let fieldValue = obj[randomField];
        let fieldChars = fieldValue.split("");
        if (fieldChars.length > 2) {
            let randomCharIndex = Math.floor(seedrandom(seedForDelete * numberStr + numberError)() * fieldChars.length);
            fieldChars.splice(randomCharIndex, 1);
            obj[randomField] = fieldChars.join("");
        }
        return obj;
    };

    const swapElement = (obj: any, numberStr: number, numberError: number) => {

        let fieldsCount = Object.keys(obj).length;
        let randomIndex = Math.floor(seedrandom(seedForSwap + numberStr + numberError)() * fieldsCount);
        let randomField = Object.keys(obj)[randomIndex];
        let fieldValue = obj[randomField];

        let fieldChars = fieldValue.split("");

        let randomCharIndex = Math.floor(seedrandom(seedForSwap * numberStr + numberError)() * fieldChars.length);
        let temp = fieldChars[randomCharIndex];

        if (randomCharIndex === fieldValue.length - 1) {
            fieldChars[randomCharIndex] = fieldChars[randomCharIndex - 1];
            fieldChars[randomCharIndex - 1] = temp;
        } else {
            fieldChars[randomCharIndex] = fieldChars[randomCharIndex + 1];
            fieldChars[randomCharIndex + 1] = temp;
        }
        fieldValue = fieldChars.join("");
        obj[randomField] = fieldValue;
        return obj;
    };



    const setErrorInTable = (countErrors: number) => {
        const tableWithError = [];
        let objWithError = {};
        for (let i = 0; i < tableData.length; i++) {
            const obj = {...tableData[i]};
            for (let j = 0; j < countErrors; j++) {

                const errorType = Math.floor(seedrandom(seed * i + j)() * 3);
                if (errorType === 0) {
                    objWithError = deleteElement(obj, i, j);
                }
                if (errorType === 1) {
                    objWithError = swapElement(obj, i, j);
                }
                if (errorType === 2) {
                    objWithError = insertElement(obj, i, j);

                }
            }

            tableWithError.push(objWithError);
        }

        setTableDataWithError(tableWithError);
    };

    const insertElement = (obj: any, numberStr: number, numberError: number) => {

        let fieldsCount = Object.keys(obj).length;
        let randomIndex = Math.floor(seedrandom(seedForInsert + numberStr + numberError)() * fieldsCount);
        let randomField = Object.keys(obj)[randomIndex];
        let fieldValue = obj[randomField];  // получаем строку из свойства fullName текущего объекта


        let fieldChars = fieldValue.split(""); // преобразуем строку в массив символов

        let randomCharIndex = Math.floor(seedrandom(seedForInsert * numberStr + numberError)() * fieldChars.length);

        const alphabet = getTranslation( language,"alphabet");
        const symbol = alphabet.charAt( Math.floor(seedrandom(seedForInsert * numberStr + numberError)() * alphabet.length));

        fieldChars.splice(randomCharIndex, 0, symbol);
        fieldValue = fieldChars.join("");
        obj[randomField] = fieldValue;

        return obj;
    };


    const handleSliderChange = (value: number) => {
        setTableDataWithError([]);
        setSliderValue(value);
        setInputValue(String(value));

        let countErrors = value;

        if (!Number.isInteger(value)) {
            let integerPart = Math.floor(value);
            let fractionalPart = value - integerPart;

            if (Math.random() < fractionalPart) countErrors = Math.ceil(value);
            else countErrors = Math.floor(value);
        }
        setCountError(countErrors);

        if (countErrors > 0) {
            setErrorInTable(countErrors);
        }

    };


    const handleInputChange = (value: string) => {
        setInputValue(value);
        const newValue = Number(value);
        if (!isNaN(newValue)) {
            setSliderValue(newValue);
        }
        handleSliderChange(Number(value));
    };

    const [items, setItems] = useState<string[]>([]);
    const [loadedCount, setLoadedCount] = useState<number>(2);


    const handleScroll = async (event: any) => {
        const { scrollTop, scrollHeight, clientHeight } = event.target;
        if (scrollHeight - scrollTop <= clientHeight + 0.5) {
            setLoadingMore(true);
            try {
                let countUsers = 10;
                const params = {
                    countUsers: countUsers,
                    countryCode: country,
                    seed,
                    startUser: currentPage * 10,
                };
                const res = await investorApi.getRequests(params);


                setTableData(prevData => [...prevData, ...res.data]);
                if (tableDataWithError.length !== 0) setTableDataWithError(prevData => [...prevData, ...res.data]);
                if (countError > 0) {
                    setErrorInTable(countError);
                }
                setCurrentPage(currentPage + 1);
            } catch (e) {
                messageApi.error(getErrorText(e));
                console.error(e);
            } finally {
                setLoadingMore(false);
            }
        }
    };

    useEffect(() => {
        const newItems = Array.from({ length: loadedCount }, (_, index) => `Item ${index + 1}`);
        setItems(newItems);
    }, [loadedCount]);

    const handleUpdateTable = async (data: any) => {
       await setTableData(data);
    };
    const handleSetTable = async (countryCode: string, seed: number) => {
        setTableDataWithError([]);
        setCountry(countryCode);
        setSeed(seed);
        let countUsers = 20;
        try {
            const params = {
                countUsers: countUsers,
                countryCode,
                seed: seed,
                startUser: 0
            };
            const res = await investorApi.getRequests(params);
            if (countError > 0) {
                setErrorInTable(countError);
            }
            await handleUpdateTable(res.data);

        } catch (e) {
            messageApi.error(getErrorText(e));
            console.error(e);
        }
    };
    const handleRandomClick = async ()=> {
        const random = Math.floor(Math.random() * 1000);
        setSeed(random);
        await handleSetTable(country, random);
        if (countError > 0) {
            setErrorInTable(countError);
        }
    };


    return (
        <div>

            <Grid container spacing={2}>
                <Grid item>
                    <Button onClick={() => {handleSetTable(translations[0].code, seed); setLanguage(translations[0].code)}}><ReactCountryFlag style={{fontSize: '2em'}} countryCode="UA"/></Button>
                </Grid>
                <Grid item>
                    <Button onClick={() => {handleSetTable(translations[1].code, seed); setLanguage(translations[1].code)}}><ReactCountryFlag style={{fontSize: '2em'}} countryCode="US"/></Button>
                </Grid>
                <Grid item>
                    <Button onClick={() => {handleSetTable(translations[2].code, seed); setLanguage(translations[2].code)}}><ReactCountryFlag style={{fontSize: '2em'}} countryCode="PL"/></Button>
                </Grid>

            </Grid>
            <Container marginBottom={10}>
                <div>
                    <Typography.Title level={5} $noMargin>{getTranslation( language,"amountOfMistakes")}</Typography.Title>
                    <SliderInput value={sliderValue} min={0} max={10} step={0.25} onChange={handleSliderChange}/>
                    <InputField value={inputValue} onChange={handleInputChange}/>
                </div>
            </Container>

            <Container marginBottom={20}>
                <div>
                    <Typography.Title level={5} $noMargin>{getTranslation( language,"setSeed")}</Typography.Title>
                    <input type="number" value={seed} onChange={(e) => handleSetTable(country, parseInt(e.target.value))}/>
                    <Button onClick={() => {handleRandomClick()}}>{getTranslation( language,"randomSeed")}</Button>
                </div>
            </Container>
            <Container marginBottom={24}>
                <Space size={'middle'}>
                    <Typography.Title level={3} $noMargin>
                        {getTranslation( language,"users")}
                    </Typography.Title>

                </Space>
            </Container>

            <div onScroll={handleScroll} style={{height: "500px", overflowY: "scroll"}}>
                <Table dataSource={tableDataWithError.length !== 0 ? tableDataWithError : tableData} loading={loading || loadingMore} pagination={false}>
                    <Table.Column title="№" dataIndex="index" key="index" render={(text, record, index) => index + 1}/>
                    <Table.Column title="uuid" dataIndex="uuid" key="uuid"/>
                    <Table.Column title={getTranslation( language,"address")} dataIndex="address" key="address"/>
                    <Table.Column title={getTranslation( language,"fullName")} dataIndex="fullName" key="fullName"/>
                    <Table.Column title={getTranslation( language,"phone")} dataIndex="phone" key="phone"/>
                </Table>
            </div>
        </div>

    );
};
